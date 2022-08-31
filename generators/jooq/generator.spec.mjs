import { expect } from 'expect';

import { helpers, lookups } from '#test-utils';

const SUB_GENERATOR = 'jooq';
const SUB_GENERATOR_NAMESPACE = `jhipster-jooq:${SUB_GENERATOR}`;

describe('SubGenerator jooq of jooq JHipster blueprint', () => {
  describe('run', () => {
    let result;
    before(async function () {
      result = await helpers
        .create(SUB_GENERATOR_NAMESPACE)
        .withOptions({
          reproducible: true,
          defaults: true,
          baseName: 'jhipster',
        })
        .withLookups(lookups)
        .run();
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('writes README', () => {
      result.assertFile('README.jooq.md');
    });

    it('writes jooq.xml', () => {
      result.assertFile('jooq.xml');
    });

    it('writes application-jooq.yml', () => {
      result.assertFile('src/main/resources/config/application-jooq.yml');
    });

    it('adds jooq.version property to pom.xml', () => {
      result.assertFileContent('pom.xml', /<jooq.version>.*<\/jooq.version>/);
    });

    it('adds jooq dependency and executions to pom.xml', () => {
      result.assertFileContent('pom.xml', '<artifactId>spring-boot-starter-jooq</artifactId>');
      result.assertFileContent('pom.xml', '<artifactId>jooq-codegen-maven</artifactId>');
      result.assertFileContent('pom.xml', '<artifactId>jooq</artifactId>');
      result.assertFileContent('pom.xml', '<artifactId>jooq-meta-extensions-liquibase</artifactId>');
    });
  });
});
