const { createTest } = require('./utils.js');

describe('jhipster-jooq:entity-server sub-generator', function () {
    this.timeout(30000);

    describe('default config', () => {
        let runResult;
        before(() => {
            return createTest('jhipster:app')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    blueprints: 'jooq',
                    withEntities: true,
                    skipPrompts: true,
                    applicationWithEntities: {
                        config: {
                            baseName: 'jhipster',
                        },
                        entities: [{ name: 'Foo' }],
                    },
                })
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        it('should write repository for the entity', () => {
            runResult.assertFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepository.java');
        });

        it('should write repository implementation for the entity', () => {
            runResult.assertFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepositoryImpl.java');
        });
    });

    describe('when jooq is disabled at entity level', () => {
        let runResult;
        before(() => {
            return createTest('jhipster:app')
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
                        entities: [{ name: 'Foo', jooq: false }],
                    },
                })
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        it('should not write repository for the entity', () => {
            runResult.assertNoFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepository.java');
        });

        it('should not write repository implementation for the entity', () => {
            runResult.assertNoFile('src/main/java/com/mycompany/myapp/repository/FooJOOQRepositoryImpl.java');
        });
    });
});
