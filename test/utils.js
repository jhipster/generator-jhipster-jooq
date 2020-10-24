const path = require('path');
const proxyquire = require('proxyquire');
const helpers = require('yeoman-test');
const EnvironmentBuilder = require('generator-jhipster/cli/environment-builder');

const createEnv = (...args) => {
    const env = EnvironmentBuilder.createEnv(...args);
    env.lookup({ packagePaths: path.join(__dirname, '..') });
    return env;
};

module.exports = {
    createTest(GeneratorOrNamespace, settings, envOptions) {
        const RunContext = proxyquire('yeoman-test/lib/run-context', { './': { ...helpers, createEnv } });
        const context = new RunContext(GeneratorOrNamespace, { ...settings, runEnvironment: true }, envOptions);
        return context;
    },
    createEnv,
};
