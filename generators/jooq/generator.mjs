import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';
import { getPomVersionProperties, getGradleLibsVersionsProperties } from 'generator-jhipster/generators/server/support';
import { TEMPLATES_MAIN_RESOURCES_DIR, TEMPLATES_MAIN_SOURCES_DIR } from 'generator-jhipster';
import command from './command.mjs';

const groupId = 'org.jooq';

const JOOQ_FAMILY_MAPPING = {
  postgresql: 'Postgres',
  mariadb: 'MariaDB',
  mysql: 'MySQL',
};

export default class extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster('bootstrap-application');
    await this.dependsOnJHipster('server');
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loading({ application }) {
        const pomFile = this.readTemplate(this.templatePath('../resources/pom.xml'));
        const gradleLibsVersions = this.readTemplate(this.templatePath('../resources/gradle/libs.versions.toml'))?.toString();

        Object.assign(
          application.javaDependencies,
          this.prepareDependencies(
            {
              ...getPomVersionProperties(pomFile),
              ...getGradleLibsVersionsProperties(gradleLibsVersions),
            },
            // Gradle doesn't allows snakeCase
            value => `'${this._.kebabCase(value).toUpperCase()}-VERSION'`,
          ),
        );
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      preparingJooq({ application }) {
        const { packageName, prodDatabaseType } = application;
        const { jooqVersion } = this.blueprintConfig;

        application.jooqVersion = jooqVersion ?? application.javaDependencies.jooq;
        application.jooqTargetName = `${packageName}.jooq`;
        application.jooqDialect = JOOQ_FAMILY_MAPPING[prodDatabaseType] || '';

        this.log.info(`Using jOOQ version ${this.jooqVersion}.`);
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.asConfiguringEachEntityTaskGroup({
      configure({ entityConfig }) {
        const { jooq } = entityConfig;
        // registerConfigPrompts sets value as null if prompt was skipped.
        if (jooq === undefined || jooq === null) {
          entityConfig.jooq = !this.blueprintConfig.jooqOptional;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      configure({ entity }) {
        if (!entity.jooq) return;
        const { upperFirst, camelCase } = this._;
        entity.jooqGeneratedClassName = upperFirst(camelCase(entity.entityTableName));
        entity.jooqGeneratedEntityReference = entity.entityTableName.toUpperCase();
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      writeJooqFiles({ application }) {
        this.writeFiles({
          templates: ['README.jooq.md', `${TEMPLATES_MAIN_RESOURCES_DIR}config/application-jooq.yml`],
          context: application,
        });
      },

      injectJooqMavenConfigurations({ application }) {
        if (!application.buildToolMaven) return;

        this.writeFiles({
          templates: ['jooq.xml'],
          context: application,
        });
      },
      jooqGradleConfigurations({ application }) {
        if (!application.buildToolGradle) return;

        this.writeFiles({
          templates: ['gradle/jooq.gradle'],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      writeJooqEntityFiles({ application, entities }) {
        const { packageFolder } = application;
        for (const entity of entities) {
          const { jooq, entityClass } = entity;
          if (!jooq) return;
          this.writeFiles({
            blocks: [
              {
                from: `${TEMPLATES_MAIN_SOURCES_DIR}package/repository/`,
                renameTo: (_ctx, fileName) => `${application.srcMainResources}${packageFolder}/repository/${entityClass}${fileName}`,
                templates: ['JOOQRepositoryImpl.java', 'JOOQRepository.java'],
              },
            ],
            context: { ...application, ...entities },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      injectJooqMavenConfigurations({ application: { buildToolMaven, jooqVersion }, source }) {
        if (!buildToolMaven) return;

        // eslint-disable-next-line no-template-curly-in-string
        const jooqPomVersion = '${jooq.version}';

        source.addMavenProperty({ property: 'jooq.version', value: jooqVersion });
        source.addMavenDependency([
          {
            artifactId: 'spring-boot-starter-jooq',
            groupId: 'org.springframework.boot',
            additionalContent: `            <!-- Exclude to synchronize with jooq-meta-extensions version -->
        <exclusions>
            <exclusion>
                <groupId>org.jooq</groupId>
                <artifactId>*</artifactId>
            </exclusion>
        </exclusions>`,
          },
          { groupId, artifactId: 'jooq', version: jooqPomVersion },
          { groupId, artifactId: 'jooq-meta', version: jooqPomVersion },
          { groupId, artifactId: 'jooq-meta-extensions-liquibase', version: jooqPomVersion },
        ]);

        source.addMavenPlugin({ groupId, artifactId: 'jooq-codegen-maven' });
        source.addMavenPluginManagement({
          groupId,
          artifactId: 'jooq-codegen-maven',
          version: jooqPomVersion,
          additionalContent: `                    <configuration>
                    <configurationFile>jooq.xml</configurationFile>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>com.h2database</groupId>
                        <artifactId>h2</artifactId>
                        <version>2.1.214</version>
                    </dependency>
                </dependencies>
                <executions>
                    <execution>
                        <id>jooq-codegen</id>
                        <phase>generate-sources</phase>
                        <goals>
                            <goal>generate</goal>
                        </goals>
                    </execution>
                </executions>`,
        });
      },

      injectJooqGradleConfigurations({ application: { buildToolGradle, jooqVersion, javaDependencies }, source }) {
        if (!buildToolGradle) return;

        source.addGradlePlugin({
          id: 'nu.studer.jooq',
          version: this.blueprintConfig.jooqGradlePluginVersion ?? javaDependencies['jooq-gradle-plugin'],
        });

        source.addGradleDependency({
          groupId,
          artifactId: 'jooq-meta-extensions-liquibase',
          scope: 'jooqGenerator',
          version: jooqVersion,
        });

        source.applyFromGradle({ script: 'gradle/jooq.gradle' });

        this.editFile(
          'build.gradle',
          createNeedleCallback({
            contentToAdd: 'jooqGenerator files("src/main/resources")',
            needle: 'jhipster-needle-gradle-dependency',
          }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup({
      jooqEnd({ application }) {
        let applicationYmlFile;
        if (this.jhipsterConfig.prodDatabaseType === this.jhipsterConfig.devDatabaseType) {
          applicationYmlFile = 'application.yml';
        } else {
          applicationYmlFile = 'application-prod.yml';
        }
        const destinationYml = `${application.srcMainResources}config/${applicationYmlFile}`;
        this.log.info(`If you want to enable jOOQ dialects append to ${destinationYml}:
spring:
  profiles:
    includes: jooq
`);
      },
    });
  }
}
