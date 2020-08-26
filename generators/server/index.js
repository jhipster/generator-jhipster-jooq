const chalk = require('chalk');
const semver = require('semver');

const DEFAULT_JOOQ_VERSION = '3.13.4';

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

            this.option('jooq-version', {
                desc: 'Use jOOQ version',
                type: String,
            });
            this.option('jooq-codegen', {
                desc: 'Use jOOQ code generator (liquibase, jpa)',
                type: String,
            });
            this.option('jooq-gradle-plugin-version', {
                desc: 'Gradle plugin version to use',
                type: String,
            });

            if (this.options.help) return;

            const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

            if (!jhContext) {
                this.error(
                    `This is a JHipster blueprint and should be used only like ${chalk.yellow(
                        'jhipster --blueprint generator-jhipster-jooq'
                    )}`
                );
            }

            this.configOptions = jhContext.configOptions || {};

            // Create/override blueprintConfig, jhipsterConfig, and constants to keep jhipster 6 compatibility.
            this.blueprintConfig = this._getStorage().createProxy();
            this.jhipsterConfig = this._getStorage('generator-jhipster').createProxy();
            this.constants = this.constants || constants;

            if (this.options.jooqVersion) {
                this.blueprintConfig.jooqVersion = this.options.jooqVersion;
            }
            if (this.options.jooqCodegen) {
                this.blueprintConfig.codegen = this.options.jooqCodegen;
            }
        }

        get configuring() {
            return {
                configureJooq() {
                    this.jooqVersion = this.blueprintConfig.jooqVersion;
                    if (this.jooqVersion === undefined) {
                        this.jooqVersion = DEFAULT_JOOQ_VERSION;
                    }
                    if (this.blueprintConfig.codegen === undefined) {
                        if (semver.lt(this.jooqVersion, '3.13.0')) {
                            this.blueprintConfig.codegen = 'jpa';
                        } else {
                            this.blueprintConfig.codegen = 'liquibase';
                        }
                    } else if (this.blueprintConfig.codegen === 'liquibase' && semver.lt(this.jooqVersion, '3.13.0')) {
                        this.warning(
                            `jOOQ version ${this.jooqVersion} doesn't supports liquibase, using version ${DEFAULT_JOOQ_VERSION} instead.`
                        );
                        this.jooqVersion = this.blueprintConfig.jooqVersion = DEFAULT_JOOQ_VERSION;
                    }
                    this.info(`Using jOOQ version ${this.jooqVersion} with ${this.blueprintConfig.codegen} code generator.`);
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
                    if (this.jhipsterConfig.buildTool === 'maven') {
                        this.renderTemplate('jooq.xml.ejs', 'jooq.xml');
                    }
                },

                injectJooqMavenConfigurations() {
                    if (this.jhipsterConfig.buildTool !== 'maven') return;
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

                    if (this.blueprintConfig.codegen !== undefined) {
                        this.addMavenDependency('org.jooq', 'jooq-meta-extensions', jooqVersion);

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
                },

                injectJooqGradleConfigurations() {
                    if (this.jhipsterConfig.buildTool !== 'gradle') return;
                    this.addGradlePluginToPluginsBlock('nu.studer.jooq', this.options.jooqGradlePluginVersion || '5.0.1');
                    this.addGradleDependency('jooqGenerator', 'org.jooq', 'jooq-meta-extensions', this.jooqVersion);
                    if (this.blueprintConfig.codegen === 'liquibase') {
                        this.fs.append(
                            this.destinationPath('build.gradle'),
                            `
jooq {
    version = '${this.jooqVersion}'  // the default (can be omitted)
    edition = nu.studer.gradle.jooq.JooqEdition.OSS  // the default (can be omitted)

    configurations {
        main {  // name of the jOOQ configuration
            generationTool {
                jdbc = null
                generator {
                    database {
                        name = 'org.jooq.meta.extensions.liquibase.LiquibaseDatabase'
                        properties {
                            property {
                                key = 'scripts'
                                value = 'src/main/resources/config/liquibase/master.xml'
                            }
                            property {
                                key = 'includeLiquibaseTables'
                                value = 'false'
                            }
                        }
                    }
                    generate {
                        deprecated = false
                        records = true
                        immutablePojos = false
                        fluentSetters = true
                    }
                    target {
                        packageName = '${this.jhipsterConfig.packageName}'
                    }
                }
            }
        }
    }
}
`
                        );
                    } else if (this.blueprintConfig.codegen === 'jpa') {
                        this.fs.append(
                            this.destinationPath('build.gradle'),
                            `
jooq {
    version = '${this.jooqVersion}'  // the default (can be omitted)
    edition = nu.studer.gradle.jooq.JooqEdition.OSS  // the default (can be omitted)

    configurations {
        main {  // name of the jOOQ configuration
            generationTool {
                jdbc = null
                generator {
                    database {
                        name = 'org.jooq.meta.extensions.jpa.JPADatabase'
                        properties {
                            property {
                                key = 'packages'
                                value = '${this.jhipsterConfig.packageName}.domain'
                            }
                            property {
                                key = 'useAttributeConverters'
                                value = 'true'
                            }
                        }
                    }
                    generate {
                        deprecated = false
                        records = true
                        immutablePojos = false
                        fluentSetters = true
                    }
                    target {
                        packageName = '${this.jhipsterConfig.packageName}'
                    }
                }
            }
        }
    }
}
`
                        );
                    }
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
                codegen: this.blueprintConfig.codegen,
            };
        }
    };
}

module.exports = {
    createGenerator,
};
