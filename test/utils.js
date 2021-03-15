const path = require('path');
const EnvironmentBuilder = require('generator-jhipster/cli/environment-builder');
const { createHelpers } = require('yeoman-test');

const helpers = createHelpers();

helpers.createEnv = (...args) => {
    const env = EnvironmentBuilder.createEnv(...args);
    env.lookup({ packagePaths: path.join(__dirname, '..') });
    return env;
};

module.exports = { helpers };
