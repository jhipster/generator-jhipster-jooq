const path = require('path');
const EnvironmentBuilder = require('generator-jhipster/cli/environment-builder');

module.exports = {
    createEnv: (...args) => {
        const env = EnvironmentBuilder.createEnv(...args);
        env.lookup({ packagePaths: path.join(__dirname, '..') });
        return env;
    },
};
