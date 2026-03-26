import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'jooq';
const SUB_GENERATOR_NAMESPACE = `jhipster-jooq:${SUB_GENERATOR}`;

describe('SubGenerator jooq of jooq JHipster blueprint', () => {
  describe('run', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig({}, [
          {
            name: 'EntityA',
            changelogDate: '20220129025419',
            jooq: true,
            fields: [
              {
                fieldName: 'name',
                fieldType: 'String',
              },
            ],
          },
        ])
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withMockedSource();
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
  });

  describe('with gradle', () => {
    beforeAll(async function () {
      await helpers
        .run(SUB_GENERATOR_NAMESPACE)
        .withJHipsterConfig(
          {
            buildTool: 'gradle',
          },
          [
            {
              name: 'EntityA',
              changelogDate: '20220129025419',
              jooq: true,
              fields: [
                {
                  fieldName: 'name',
                  fieldType: 'String',
                },
              ],
            },
          ],
        )
        .withOptions({
          ignoreNeedlesError: true,
        })
        .withJHipsterGenerators()
        .withConfiguredBlueprint()
        .withMockedSource();
    });

    it('should succeed', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('writes README', () => {
      result.assertFile('README.jooq.md');
    });

    it('writes gradle/jooq.gradle', () => {
      result.assertFile('gradle/jooq.gradle');
    });

    it('writes application-jooq.yml', () => {
      result.assertFile('src/main/resources/config/application-jooq.yml');
    });
  });
});
