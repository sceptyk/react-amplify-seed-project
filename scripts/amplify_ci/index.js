const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

const envName = process.argv[2];
const shouldPublish = process.argv[3];

console.log('Environment parameter: ', envName);
if (!envName) {
  process.exit(1);
}

function executeCommand(cmd) {
  return new Promise(async resolve => {
    await exec(
      cmd,
      stdout => {
        console.log('Cmd: ', cmd);
        if (stdout) {
          console.log(stdout);

          if (stdout instanceof Error) {
            process.exit(1);
          }
        } else {
          console.log('Finished');
        }

        resolve();
      },
      err => {
        console.log(err);
        process.exit(1);
      }
    );
  });
}

const envConfig = JSON.stringify({ envName }).replace(/\"/g, '\\"');

const awsConfig = JSON.stringify({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1',
  useProfile: false,
  configLevel: 'project'
}).replace(/\"/g, '\\"');

const initCmd = `amplify init --amplify "${envConfig}" --awscloudformation "${awsConfig}" --yes`;
const pullEnvCmd = `amplify env pull --yes`;
const publishCmd = `amplify publish --yes`;

executeCommand(initCmd).then(() => {
  if (shouldPublish) {
    executeCommand(pullEnvCmd).then(() => {
      executeCommand(publishCmd);
    });
  }
});
