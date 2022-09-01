import { GeneratorBaseEntities, constants } from 'generator-jhipster';
import {
  PRIORITY_PREFIX,
  PREPARING_PRIORITY,
  CONFIGURING_EACH_ENTITY_PRIORITY,
  PREPARING_EACH_ENTITY_PRIORITY,
  WRITING_PRIORITY,
  WRITING_ENTITIES_PRIORITY,
  POST_WRITING_PRIORITY,
  END_PRIORITY,
} from 'generator-jhipster/esm/priorities';

const { SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR } = constants;

const DEFAULT_JOOQ_VERSION = '3.17.3';
const DEFAULT_JOOQ_GRADLE_PLUGIN_VERSION = '7.1.1';

const JOOQ_FAMILY_MAPPING = {
  postgresql: 'Postgres',
  mariadb: 'MariaDB',
  mysql: 'MySQL',
};

export default class JooqGenerator extends GeneratorBaseEntities {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, unique: 'namespace', ...features });
  }

  async _postConstruct() {
    await this.dependsOnJHipster('bootstrap-application');
    await this.dependsOnJHipster('server');
  }

  get [PREPARING_PRIORITY]() {
    return {
      preparingJooq({ application }) {
        const { baseName, packageName, prodDatabaseType } = application;
        const { jooqVersion = DEFAULT_JOOQ_VERSION } = this.blueprintConfig;

        application.jooqVersion = jooqVersion;
        application.mainClass = this.getMainClassName(baseName);
        application.jooqTargetName = `${packageName}.jooq`;
        application.jooqDialect = JOOQ_FAMILY_MAPPING[prodDatabaseType] || '';

        this.info(`Using jOOQ version ${this.jooqVersion}.`);
      },
    };
  }

  get [CONFIGURING_EACH_ENTITY_PRIORITY]() {
    return {
      configure({ entityConfig }) {
        const { jooq } = entityConfig;
        // registerConfigPrompts sets value as null if prompt was skipped.
        if (jooq === undefined || jooq === null) {
          entityConfig.jooq = !this.blueprintConfig.jooqOptional;
        }
      },
    };
  }

  get [PREPARING_EACH_ENTITY_PRIORITY]() {
    return {
      configure({ entity }) {
        if (!entity.jooq) return;
        const { upperFirst, camelCase } = this._;
        entity.jooqGeneratedClassName = upperFirst(camelCase(entity.entityTableName));
        entity.jooqGeneratedEntityReference = entity.entityTableName.toUpperCase();
      },
    };
  }

  /** @typedef {(this: this, args: ApplicationTaskParam) => Promise<void>} ApplicationTask */
  /** @returns {Record<string, ApplicationTask>} */
  get [WRITING_PRIORITY]() {
    return {
      writeJooqFiles({ application }) {
        this.writeFiles({
          templates: ['README.jooq.md', `${SERVER_MAIN_RES_DIR}config/application-jooq.yml`],
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
    };
  }

  /** @typedef {ApplicationTaskParam & { entities: Object.<string, any>[] }} WritingEntitiesTaskParam */
  /** @typedef {(this: this, args: WritingEntitiesTaskParam) => Promise<void>} WritingEntitiesTask */
  /** @returns {Record<string, WritingEntitiesTask>} */
  get [WRITING_ENTITIES_PRIORITY]() {
    return {
      writeJooqEntityFiles({ application, entities }) {
        const { packageFolder } = application;
        for (const entity of entities) {
          const { jooq, entityClass } = entity;
          if (!jooq) return;
          this.writeFiles({
            blocks: [
              {
                from: `${SERVER_MAIN_SRC_DIR}package/repository/`,
                renameTo: (_ctx, fileName) => `${SERVER_MAIN_SRC_DIR}${packageFolder}/repository/${entityClass}${fileName}`,
                templates: ['JOOQRepositoryImpl.java', 'JOOQRepository.java'],
              },
            ],
            context: { ...application, ...entities },
          });
        }
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    return {
      injectJooqMavenConfigurations({ application: { buildToolMaven, jooqVersion } }) {
        if (!buildToolMaven) return;
        this.addJooqWithMaven(jooqVersion);
      },

      injectJooqGradleConfigurations({ application: { buildToolGradle, jooqVersion, jooqTargetName } }) {
        if (!buildToolGradle) return;
        this.addJooqWithGradle(jooqVersion, jooqTargetName);
      },
    };
  }

  get [END_PRIORITY]() {
    return {
      jooqEnd() {
        let applicationYmlFile;
        if (this.jhipsterConfig.prodDatabaseType === this.jhipsterConfig.devDatabaseType) {
          applicationYmlFile = 'application.yml';
        } else {
          applicationYmlFile = 'application-prod.yml';
        }
        const destinationYml = `${SERVER_MAIN_RES_DIR}config/${applicationYmlFile}`;
        this.info(`If you want to enable jOOQ dialects append to ${destinationYml}:
spring:
  profiles:
    includes: jooq
`);
      },
    };
  }

  /**
   * Adds dependencies, and required files for maven
   */
  addJooqWithMaven(jooqVersion) {
    // eslint-disable-next-line no-template-curly-in-string
    const jooqPomVersion = '${jooq.version}';
    this.addMavenProperty('jooq.version', jooqVersion);
    this.addMavenDependency(
      'org.springframework.boot',
      'spring-boot-starter-jooq',
      undefined,
      `            <!-- Exclude to synchronize with jooq-meta-extensions version -->
         <exclusions>
            <exclusion>
                <groupId>org.jooq</groupId>
                <artifactId>*</artifactId>
            </exclusion>
        </exclusions>`
    );

    this.addMavenDependency('org.jooq', 'jooq', jooqPomVersion);
    this.addMavenDependency('org.jooq', 'jooq-meta', jooqPomVersion);
    this.addMavenDependency('org.jooq', 'jooq-meta-extensions-liquibase', jooqPomVersion);

    this.addMavenPlugin('org.jooq', 'jooq-codegen-maven');

    this.addMavenPluginManagement(
      'org.jooq',
      'jooq-codegen-maven',
      jooqPomVersion,
      `                    <configuration>
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
                </executions>`
    );
  }

  /**
   * Adds dependencies, and required files for gradle
   */
  addJooqWithGradle(jooqVersion, jooqTargetName) {
    this.addGradlePluginToPluginsBlock(
      'nu.studer.jooq',
      this.blueprintConfig.jooqGradlePluginVersion || DEFAULT_JOOQ_GRADLE_PLUGIN_VERSION
    );
    this.addGradleDependency('jooqGenerator', 'org.jooq', 'jooq-meta-extensions-liquibase', jooqVersion);

    const rewriteFileModel = this.needleApi.serverGradle.generateFileModelWithPath(
      '.',
      'build.gradle',
      'jhipster-needle-gradle-dependency',
      'jooqGenerator files("src/main/resources")'
    );
    this.needleApi.serverGradle.addBlockContentToFile(rewriteFileModel, 'Error adding jOOQ dependency.');

    this.fs.append(
      this.destinationPath('build.gradle'),
      `
// START OF CONFIGURATION ADDED BY JOOQ BLUEPRINT
jooq {
version = '${jooqVersion}'  // the default (can be omitted)
edition = nu.studer.gradle.jooq.JooqEdition.OSS  // the default (can be omitted)

configurations {
    main {  // name of the jOOQ configuration
        generationTool {
            generator {
                database {
                    name = 'org.jooq.meta.extensions.liquibase.LiquibaseDatabase'
                    properties {
                        property {
                            key = 'scripts'
                            value = 'config/liquibase/master.xml'
                        }
                        property {
                            key = 'changeLogParameters.contexts'
                            value = 'prod'
                        }
                    }
                }
                target {
                    packageName = '${jooqTargetName}'
                }
            }
        }
    }
}
}
// END OF CONFIGURATION ADDED BY JOOQ BLUEPRINT
`
    );
  }
}
