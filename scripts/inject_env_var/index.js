const fs = require('fs');
const path = require('path');

const env = process.argv[2];
console.log('Environment parameter: ', env);
if (!env) {
  process.exit(0);
}

function readDotEnv() {
  const content = fs.readFileSync(path.join(__dirname, '../../.env'), 'utf8');
  const lines = content.split('\r\n');

  const kvp = {};

  lines.forEach(line => {
    const [key, value] = line.split('=');
    kvp[key] = value.replace(/\"/g, '');
  });

  return kvp;
}

function injectEnvVars(kvp) {
  Object.keys(kvp).forEach(key => {
    const envKey = `${key}_${env}`.toUpperCase();
    const newValue = process.env[envKey];
    if (newValue) kvp[key] = newValue;
  });

  return kvp;
}

function writeDotEnv(kvp) {
  const lines = Object.entries(kvp).map(([key, value]) => {
    return `${key}=\"${value}\"`;
  });
  const content = lines.join('\r\n');

  fs.writeFileSync(path.join(__dirname, '../../.env'), content);
}

const kvp = readDotEnv();
const injected = injectEnvVars(kvp);
writeDotEnv(injected);
