const path = require('path');
const helpers = require('yeoman-test');

describe('jhipster-jooq:server sub-generator (Server blueprint)', function () {
    this.timeout(30000);
    describe('Sample test', () => {
        let runResult;
        before(() => {
            return helpers
                .create('jhipster:server')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    blueprints: 'jooq',
                })
                .withLookups([{ npmPaths: path.join(__dirname, '..', 'node_modules') }, { packagePaths: path.join(__dirname, '..') }])
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        it('adds jooq', () => {
            runResult.assertFileContent('pom.xml', 'spring-boot-starter-jooq');
        });
    });
});
