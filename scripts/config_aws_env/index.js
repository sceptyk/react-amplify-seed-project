const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const env = process.argv[2];
console.log('Environment parameter: ', env);
if (!env) {
  process.exit(0);
}

/**
 * HELPERS
 */

function printResults(err, data) {
  if (err) console.log(err, err.stack);
}

function getAwsExports() {
  const awsExportsFile = fs.readFileSync(path.join(__dirname, '../../src/aws-exports.js'), 'utf8');

  const content = JSON.parse(awsExportsFile.split(/=\s/)[1].split(/;\s/)[0]);

  return content;
}

function getGraphqlConfig() {
  const graphqlConfig = fs.readFileSync(path.join(__dirname, '../../.graphqlconfig.yml'), 'utf8');

  const content = {};
  graphqlConfig.split('\n').forEach(pair => {
    let [key, value] = pair.split(': ');
    if (value) {
      key = key.replace(/\s/g, '');
      value = value.replace(/\s/g, '');
      content[key] = value;
    }
  });

  return content;
}

function getDotEnv() {
  const content = fs.readFileSync(path.join(__dirname, '../../.env'), 'utf8');
  const vars = {};
  content.split('\r\n').forEach(line => {
    const [key, value] = line.split('=');
    vars[key] = value.replace(/\"/g, '');
  });
  return vars;
}

/**
 * CORE
 */
async function updateAppSyncAuthenticationType(context) {
  console.log('-updateAppSyncAuthenticationType');
  const appsync = new AWS.AppSync();
  appsync.updateGraphqlApi(
    {
      apiId: context.key,
      name: context.name,
      authenticationType: 'AWS_IAM'
    },
    printResults
  );
}

async function allowUnAuthenticated(context) {
  console.log('-allowUnAuthenticated');
  const cognitoidentity = new AWS.CognitoIdentity();
  cognitoidentity.updateIdentityPool(
    {
      AllowUnauthenticatedIdentities: true,
      IdentityPoolId: context.id,
      IdentityPoolName: context.name,
      CognitoIdentityProviders: [
        {
          ClientId: context.clientId,
          ProviderName: 'cognito-idp.' + context.region + '.amazonaws.com/' + context.userPoolId,
          ServerSideTokenCheck: false
        }
      ]
    },
    printResults
  );
}

async function createAppsyncPoliciesAndAttachToRoles(context, amplifyContext) {
  console.log('-createAppsyncPoliciesAndAttachToRoles');

  const ejs = require('ejs');
  const policiesPath = path.join(__dirname, 'policies', 'api');
  const iam = new AWS.IAM();

  fs.readdir(policiesPath, (err, roles) => {
    roles.forEach(role => {
      console.log('--Processing role: ', role);

      const rolePoliciesPath = path.join(policiesPath, role);
      const buildPath = path.join(rolePoliciesPath, 'build');

      fs.readdir(rolePoliciesPath, (err, entries) => {
        entries.forEach(async policyFile => {
          const ext = path.parse(policyFile).ext;
          if (ext !== '.ejs') return;

          console.log('--Processing policy file: ', policyFile);
          const policyName = path.parse(policyFile).name;
          let policyDoc;
          try {
            policyDoc = await ejs.renderFile(
              path.join(rolePoliciesPath, policyFile),
              { context: context },
              { async: true }
            );
          } catch (e) {
            console.error(e);
            process.exit(0);
          }

          const policyFileJson = policyName + '.json';
          const policyCompiledPath = path.join(buildPath, policyFileJson);
          try {
            if (!fs.existsSync(buildPath)) {
              fs.mkdirSync(buildPath);
            }
            fs.writeFileSync(policyCompiledPath, policyDoc);
          } catch (e) {
            console.error(e);
            process.exit(0);
          }

          const policyFullName = amplifyContext.projectName + '_' + policyName + '_' + env;

          iam.putRolePolicy(
            {
              PolicyDocument: JSON.stringify(JSON.parse(policyDoc), null, 0),
              PolicyName: policyFullName,
              RoleName: context[role]
            },
            printResults
          );
        });
      });
    });
  });
}

async function updateS3CORSPolicy(context) {
  console.log('-updateS3CORSPolicy');

  const s3 = new AWS.S3();
  const corsPolicyPath = path.join(__dirname, 'policies', 's3', 'cors.policy.json');
  const corsPolicy = JSON.parse(fs.readFileSync(corsPolicyPath, 'utf-8'));

  s3.putBucketCors(
    {
      Bucket: context.bucket,
      CORSConfiguration: corsPolicy
    },
    printResults
  );
}

async function updateFunctionEnvVarsAndPolicies(context) {
  console.log('-updateFunctionEnvVarsAndPolicies');

  const iam = new AWS.IAM();
  const lambda = new AWS.Lambda();
  const functions = ['subscription', 'claim', 'stripehooks'];

  const dotEnv = getDotEnv();

  functions.forEach(functionName => {
    console.log(`--${functionName}`);
    functionNameEnv = `${functionName}-${env}`;

    lambda.updateFunctionConfiguration(
      {
        FunctionName: functionNameEnv,
        Environment: {
          Variables: {
            ENV: env,
            TABLE_KEY: context.key,
            TABLE_REGION: context.region,
            STRIPE_SECRET: dotEnv['STRIPE_SECRET'],
            STRIPE_WEBHOOK_SECRET: dotEnv['STRIPE_WEBHOOK_SECRET']
          }
        }
      },
      printResults
    );

    const functionCloudFormationTemplate = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          `../../amplify/backend/function/${functionName}/${functionName}-cloudformation-template.json`
        ),
        'utf8'
      )
    );
    const roleName =
      functionCloudFormationTemplate.Resources.LambdaExecutionRole.Properties.RoleName['Fn::If'][1] + '-' + env;

    const policyFullName = 'DynamoDBAccess';
    const policyDoc = JSON.stringify(
      JSON.parse(fs.readFileSync(path.join(__dirname, 'policies', 'function', 'dynamodb.policy.json'), 'utf8')),
      null,
      0
    );

    iam.putRolePolicy(
      {
        PolicyDocument: policyDoc,
        PolicyName: policyFullName,
        RoleName: roleName
      },
      printResults
    );
  });
}

async function updateGlobalSecondaryIndexes(context) {
  console.log('-updateGlobalSecondaryIndexes');
  let dynamodb = new AWS.DynamoDB();

  function getTableName(name) {
    return `${name}-${context.key}-${env}`;
  }

  const indexes = [
    {
      TableName: getTableName('Review'),
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        },
        {
          AttributeName: 'owner',
          AttributeType: 'S'
        },
        {
          AttributeName: 'reviewAdvertId',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'gsi-UserReviews',
            KeySchema: [
              {
                AttributeName: 'owner',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'reviewAdvertId',
                KeyType: 'RANGE'
              }
            ],
            Projection: {
              ProjectionType: 'KEYS_ONLY'
            }
          }
        }
      ]
    },
    {
      TableName: getTableName('Advert'),
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        },
        {
          AttributeName: 'owner',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'gsi-UserAdvert',
            KeySchema: [
              {
                AttributeName: 'owner',
                KeyType: 'HASH'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            }
          }
        }
      ]
    }
  ];

  await Promise.all(
    indexes.map(params => {
      return new Promise((resolve, reject) => {
        dynamodb.updateTable(params, err => {
          if (err) {
            reject();
            printResults(err);
          } else {
            resolve();
          }
        });
      });
    })
  );
}

async function updateCognitoDomain(context) {
  console.log('-updateCognitoDomain');

  await new Promise((resolve, reject) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();

    const domain = 'golex-' + env;
    cognito.describeUserPoolDomain(
      {
        Domain: domain
      },
      (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          if (data.DomainDescription.UserPoolId == null) {
            cognito.createUserPoolDomain(
              {
                Domain: domain,
                UserPoolId: context.userPoolId
              },
              (err, data) => {
                printResults(err, data);
                if (err) reject(err);
                else resolve();
              }
            );
          }
        }
      }
    );
  });
}

async function updateConfiguration(env) {
  const teamProviderInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../amplify/team-provider-info.json'), 'utf8')
  );

  const backendInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../amplify/backend/backend-config.json'), 'utf8')
  );

  const awsExports = getAwsExports();
  const graphqlConfig = getGraphqlConfig();

  //Amplify Context
  const amplifyConfigFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../amplify/.config/project-config.json'), 'utf8')
  );
  const amplifyCtx = {};
  amplifyCtx.projectName = amplifyConfigFile.projectName;

  //Appsync Context
  const appsyncCtx = {};
  appsyncCtx.name = 'web-' + env;
  appsyncCtx.key = graphqlConfig.graphQLApiId;
  appsyncCtx.region = awsExports.aws_appsync_region;

  //Identity Pools Context
  const identityCtx = {};
  identityCtx.id = awsExports.aws_cognito_identity_pool_id;
  Object.keys(backendInfo.auth).forEach(auth => {
    const uid = auth.replace('cognito', '');
    identityCtx.name = auth + '_identitypool_' + uid + '__' + env;
    return;
  });
  identityCtx.userPoolId = awsExports.aws_user_pools_id;
  identityCtx.clientId = awsExports.aws_user_pools_web_client_id;
  identityCtx.region = awsExports.aws_cognito_region;

  //Roles Context
  const rolesCtx = {};
  const accountId = teamProviderInfo[env].awscloudformation.StackId.split(':')[4];
  rolesCtx.endpointArn =
    'arn:aws:appsync:' + teamProviderInfo[env].awscloudformation.Region + ':' + accountId + ':apis/' + appsyncCtx.key;
  rolesCtx.unauth = teamProviderInfo[env].awscloudformation.UnauthRoleName;
  rolesCtx.auth = teamProviderInfo[env].awscloudformation.AuthRoleName;

  //s3 Context
  const s3Ctx = {};
  s3Ctx.bucket = awsExports.aws_user_files_s3_bucket;

  const context = {
    appsync: appsyncCtx,
    identityPool: identityCtx,
    roles: rolesCtx,
    s3: s3Ctx,
    amplify: amplifyCtx
  };

  const envConfigPath = path.join(__dirname, '/config/', env + '.json');
  fs.writeFileSync(envConfigPath, JSON.stringify(context, null, 4));

  AWS.config.update({ region: appsyncCtx.region });
}

/**
 * FIXME remove when feature https://github.com/aws-amplify/amplify-cli/issues/1055
 */
async function updateAppsyncPipeline(context) {
  console.log('-updateAppsyncPipeline');

  const appsync = new AWS.AppSync();

  const functions = [
    {
      id: null,
      name: 'Update_advert_review_counts',
      source: 'AdvertTable'
    },
    {
      id: null,
      name: 'Get_advert_scores',
      source: 'AdvertTable'
    },
    {
      id: null,
      name: 'Get_advert_tier',
      source: 'AdvertTable'
    },
    {
      id: null,
      name: 'Mutation_updateAdvert_Function',
      source: 'AdvertTable'
    },
    {
      id: null,
      name: 'Mutation_createReview_Function',
      source: 'ReviewTable'
    },
    {
      id: null,
      name: 'Get_user_reviews',
      source: 'ReviewTable'
    },
    {
      id: null,
      name: 'Mutation_createAdvert_Function',
      source: 'AdvertTable'
    },
    {
      id: null,
      name: 'Get_user_advert',
      source: 'AdvertTable'
    }
  ];

  console.log('--get functions metadata');
  try {
    await new Promise((resolve, reject) => {
      appsync.listFunctions(
        {
          apiId: context.key
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            data.functions.forEach(f => {
              const found = functions.find(func => func.name === f.name);
              if (found != null) {
                found.id = f.functionId;
              }
            });
            resolve();
          }
        }
      );
    });
  } catch (error) {
    return console.log(error);
  }

  console.log('--create or update functions');
  try {
    const getFunctionParams = func => ({
      apiId: context.key,
      dataSourceName: func.source,
      functionVersion: '2018-05-29',
      name: func.name,
      requestMappingTemplate: fs.readFileSync(path.join(__dirname, 'functions', func.name + '.req.vtl'), 'utf8'),
      responseMappingTemplate: fs.readFileSync(path.join(__dirname, 'functions', func.name + '.res.vtl'), 'utf8')
    });

    await Promise.all(
      functions.map(func => {
        if (func.id == null) {
          return new Promise((resolve, reject) => {
            appsync.createFunction(getFunctionParams(func), (err, data) => {
              if (err) {
                reject(err);
              } else {
                func.id = data.functionConfiguration.functionId;
                resolve();
              }
            });
          });
        } else {
          return new Promise((resolve, reject) => {
            appsync.updateFunction(
              Object.assign({}, getFunctionParams(func), {
                functionId: func.id
              }),
              err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        }
      })
    );
  } catch (error) {
    return console.log(error);
  }

  console.log('--update pipeline resolvers');
  const pipelines = [
    {
      fieldName: 'createReview',
      typeName: 'Mutation',
      functions: [
        functions.find(f => f.name === 'Get_user_reviews').id,
        functions.find(f => f.name === 'Mutation_createReview_Function').id,
        functions.find(f => f.name === 'Get_advert_scores').id,
        functions.find(f => f.name === 'Update_advert_review_counts').id
      ]
    },
    {
      fieldName: 'updateAdvert',
      typeName: 'Mutation',
      functions: [
        functions.find(f => f.name === 'Get_advert_tier').id,
        functions.find(f => f.name === 'Mutation_updateAdvert_Function').id
      ]
    },
    {
      fieldName: 'createAdvert',
      typeName: 'Mutation',
      functions: [
        functions.find(f => f.name === 'Get_user_advert').id,
        functions.find(f => f.name === 'Mutation_createAdvert_Function').id
      ]
    },
    {
      fieldName: 'getAdvertByOwner',
      typeName: 'Query',
      functions: [functions.find(f => f.name === 'Get_user_advert').id]
    }
  ];

  const typeNames = {};
  pipelines.forEach(pipeline => {
    typeNames[pipeline.typeName] = null;
  });

  await Promise.all(
    Object.keys(typeNames).map(typeName => {
      return new Promise((resolve, reject) => {
        appsync.listResolvers(
          {
            apiId: context.key,
            typeName: typeName
          },
          (err, data) => {
            if (err) {
              printResults(err);
              reject();
            } else {
              data.resolvers.forEach(resolver => {
                const pipeline = pipelines.find(p => p.fieldName === resolver.fieldName);
                if (pipeline) {
                  pipeline.created = true;
                }
              });
              resolve();
            }
          }
        );
      });
    })
  );

  try {
    await Promise.all(
      pipelines.map(pipeline => {
        if (pipeline.created) {
          new Promise((resolve, reject) => {
            appsync.updateResolver(
              {
                apiId: context.key,
                fieldName: pipeline.fieldName,
                typeName: pipeline.typeName,
                kind: 'PIPELINE',
                requestMappingTemplate: '{}',
                responseMappingTemplate: '$util.toJson($context.result)',
                pipelineConfig: {
                  functions: pipeline.functions
                }
              },
              err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        } else {
          new Promise((resolve, reject) => {
            appsync.createResolver(
              {
                apiId: context.key,
                fieldName: pipeline.fieldName,
                typeName: pipeline.typeName,
                kind: 'PIPELINE',
                requestMappingTemplate: '{}',
                responseMappingTemplate: '$util.toJson($context.result)',
                pipelineConfig: {
                  functions: pipeline.functions
                }
              },
              err => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        }
      })
    );
  } catch (error) {
    console.log(error);
  }

  console.log('--Done');
}

async function getContext(env) {
  const configFile = fs.readFileSync(path.join(__dirname, '/config/' + env + '.json'), 'utf8');
  const context = JSON.parse(configFile);

  if (!context) {
    process.exit(0);
  }

  return context;
}

/**
 * EXECUTE
 */

(async () => {
  try {
    // await updateConfiguration(env);
    // const context = await getContext(env);

    // await updateAppSyncAuthenticationType(context.appsync);
    // await updateFunctionEnvVarsAndPolicies(context.appsync);
    // await updateAppsyncPipeline(context.appsync);
    // await allowUnAuthenticated(context.identityPool);
    // await updateCognitoDomain(context.identityPool);
    // await createAppsyncPoliciesAndAttachToRoles(context.roles, context.amplify);
    // await updateGlobalSecondaryIndexes(context.appsync);
    // await updateS3CORSPolicy(context.s3);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
