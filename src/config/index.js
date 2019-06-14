import aws_config from './aws-exports';

const env = process.env.NODE_ENV;
console.log('ENVIRONMENT: ', env);

class ConfigManager {
  get() {
    let config = aws_config;
    config.aws_appsync_authenticationType = 'AWS_IAM';

    return config;
  }
}

const ConfigManagerInstance = new ConfigManager();
export default ConfigManagerInstance;
