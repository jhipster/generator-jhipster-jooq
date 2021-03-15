const { helpers } = require('./utils');

describe('jhipster-jooq:server sub-generator (Server blueprint)', function () {
    this.timeout(30000);

    describe('with maven', () => {
        let runResult;
        before(async () => {
            runResult = await helpers
                .create('jhipster:server')
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    blueprints: 'jooq',
                })
                .run();
        });

        it('writes README', () => {
            runResult.assertFile('README.jooq.md');
        });

        it('writes jooq.xml', () => {
            runResult.assertFile('jooq.xml');
        });

        it('writes application-jooq.yml', () => {
            runResult.assertFile('src/main/resources/config/application-jooq.yml');
        });

        it('adds jooq.version property to pom.xml', () => {
            runResult.assertFileContent('pom.xml', /<jooq.version>.*<\/jooq.version>/);
        });

        it('adds jooq dependency and executions to pom.xml', () => {
            runResult.assertFileContent('pom.xml', '<artifactId>spring-boot-starter-jooq</artifactId>');
            runResult.assertFileContent('pom.xml', '<artifactId>jooq-codegen-maven</artifactId>');
            runResult.assertFileContent('pom.xml', '<artifactId>jooq</artifactId>');
            runResult.assertFileContent('pom.xml', '<artifactId>jooq-meta-extensions-liquibase</artifactId>');
        });
    });
});
