const chalk = require('chalk');

const DEFAULT_JOOQ_VERSION = '3.14.8';

const JOOQ_FAMILY_MAPPING = {
    postgresql: 'Postgres',
    mariadb: 'MariaDB',
    mysql: 'MySQL',
};

function createGenerator(env) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const constants = require(`${env.getPackagePath('jhipster:server')}/generators/generator-constants`);
    return class extends env.requireGenerator('jhipster:server') {
        constructor(args, opts) {
            super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

            this.sbsBlueprint = true;

            if (this.options.help) return;

            const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

            if (!jhContext) {
                this.error(
                    `This is a JHipster blueprint and should be used only like ${chalk.yellow(
                        'jhipster --blueprint generator-jhipster-jooq'
                    )}`
                );
            }

            // Create/override blueprintConfig, jhipsterConfig, and constants to keep jhipster 6 compatibility.
            this.blueprintStorage = this._getStorage();

            this.configOptions = jhContext.configOptions || {};

            // Create/override blueprintConfig, jhipsterConfig, and constants to keep jhipster 6 compatibility.
            this.blueprintConfig = this.blueprintStorage.createProxy();
            this.jhipsterConfig = this._getStorage('generator-jhipster').createProxy();
            this.constants = this.constants || constants;
        }

        get configuring() {
            return {
                configureJooq() {
                    this.jooqVersion = this.blueprintConfig.jooqVersion;
                    if (this.jooqVersion === undefined) {
                        this.jooqVersion = DEFAULT_JOOQ_VERSION;
                    }
                    this.info(`Using jOOQ version ${this.jooqVersion}.`);
                },
            };
        }

        get default() {
            return {
                prepareForTemplates() {
                    this.jooqTargetName = `${this.jhipsterConfig.packageName}.jooq`;
                    this.jooqDialect = JOOQ_FAMILY_MAPPING[this.jhipsterConfig.prodDatabaseType] || '';
                },
            };
        }

        get writing() {
            return {
                writeJooqFiles() {
                    this.renderTemplate('README.jooq.md.ejs', 'README.jooq.md');
                    this.renderTemplate(
                        `${this.constants.SERVER_MAIN_RES_DIR}config/application-jooq.yml.ejs`,
                        `${this.constants.SERVER_MAIN_RES_DIR}config/application-jooq.yml`
                    );
                },

                injectJooqMavenConfigurations() {
                    if (this.jhipsterConfig.buildTool !== 'maven') return;
                    this._addJooqWithMaven();
                },

                injectJooqGradleConfigurations() {
                    if (this.jhipsterConfig.buildTool !== 'gradle') return;
                    this._addJooqWithGradle();
                },
            };
        }

        get end() {
            return {
                jooqEnd() {
                    let applicationYmlFile;
                    if (this.jhipsterConfig.prodDatabaseType === this.jhipsterConfig.devDatabaseType) {
                        applicationYmlFile = 'application.yml';
                    } else {
                        applicationYmlFile = 'application-prod.yml';
                    }
                    const destinationYml = `${this.constants.SERVER_MAIN_RES_DIR}config/${applicationYmlFile}`;
                    this.info(`If you want to enable jOOQ dialects append to ${destinationYml}:
spring:
  profiles:
    includes: jooq
`);
                },
            };
        }

        /* Custom data to be passed to templates */
        _templateData() {
            return {
                jooqVersion: this.jooqVersion,
                jooqTargetName: this.jooqTargetName,
                jooqDialect: this.jooqDialect,
            };
        }

        /**
         * Adds dependencies, and required files for maven
         */
        _addJooqWithMaven() {
            this.renderTemplate('jooq.xml.ejs', 'jooq.xml');

            // eslint-disable-next-line no-template-curly-in-string
            const jooqVersion = '${jooq.version}';
            this.addMavenProperty('jooq.version', this.jooqVersion);
            this.addMavenDependency(
                'org.springframework.boot',
                'spring-boot-starter-jooq',
                undefined,
                `            <!-- Exclude to synchronize with jooq-meta-extensions version -->
             <exclusions>
                <exclusion>
                    <groupId>org.jooq</groupId>
                    <artifactId>jooq</artifactId>
                </exclusion>
            </exclusions>`
            );
            this.addMavenDependency('org.jooq', 'jooq');

            // Match jooq version.
            this.addMavenDependencyManagement('org.jooq', 'jooq', jooqVersion);

            this.addMavenDependency('org.jooq', 'jooq-meta-extensions-liquibase', jooqVersion);

            this.addMavenPlugin('org.jooq', 'jooq-codegen-maven');

            this.addMavenPluginManagement(
                'org.jooq',
                'jooq-codegen-maven',
                jooqVersion,
                `                    <configuration>
                        <configurationFile>jooq.xml</configurationFile>
                    </configuration>
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
        _addJooqWithGradle() {
            this.addGradlePluginToPluginsBlock('nu.studer.jooq', this.blueprintConfig.jooqGradlePluginVersion || '5.0.2');
            this.addGradleDependency('jooqGenerator', 'org.jooq', 'jooq-meta-extensions', this.jooqVersion);

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
    version = '${this.jooqVersion}'  // the default (can be omitted)
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
                                value = 'src/main/resources/config/liquibase/master.xml'
                            }
                            property {
                                key = 'changeLogParameters.contexts'
                                value = 'prod'
                            }
                        }
                    }
                    target {
                        packageName = '${this.jooqTargetName}'
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
    };
}

module.exports = {
    createGenerator,
};
