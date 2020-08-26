const path = require('path');
const helpers = require('yeoman-test');

describe('jhipster-jooq:entity-server sub-generator', function () {
    this.timeout(30000);
    describe('any configuration', () => {
        let runResult;
        before(() => {
            return helpers
                .create('jhipster:app')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    blueprints: 'jooq',
                    withEntities: true,
                    applicationWithEntities: {
                        config: {
                            baseName: 'jhipster',
                        },
                        entities: [{ name: 'Foo' }],
                    },
                })
                .withLookups([{ npmPaths: path.join(__dirname, '..', 'node_modules') }, { packagePaths: path.join(__dirname, '..') }])
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        it('writes repository for the entity', () => {
            runResult.assertFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepository.java');
        });

        it('writes repository implementation for the entity', () => {
            runResult.assertFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepositoryImpl.java');
        });
    });
});
