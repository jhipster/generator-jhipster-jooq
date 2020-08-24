const chalk = require('chalk');
const semver = require('semver');

const DEFAULT_JOOQ_VERSION = '3.13.4';

function createGenerator(env) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const constants = require(`${env.getPackagePath('jhipster:server')}/generators/generator-constants`);
    return class extends env.requireGenerator('jhipster:server') {
        constructor(args, opts) {
            super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

            this.sbsBlueprint = true;

            this.option('jooq-version', {
                desc: 'Use JOOQ version',
                type: String,
            });
            this.option('jooq-codegen', {
                desc: 'Use JOOQ code generator (liquibase, jpa)',
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

            if (!this.blueprintStorage) {
                this.blueprintStorage = this._getStorage();
                this.blueprintConfig = this.blueprintStorage.createProxy();
            }

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
                        // Match jooq version with spring-boot provided one.
                        if ((this.constants || constants).SPRING_BOOT_VERSION.includes('2.2.9')) {
                            this.jooqVersion = '3.12.4';
                        } else {
                            this.jooqVersion = DEFAULT_JOOQ_VERSION;
                        }
                    }
                    if (this.blueprintConfig.codegen === undefined) {
                        if (semver.lt(this.jooqVersion, '3.13.0')) {
                            this.blueprintConfig.codegen = 'jpa';
                        } else {
                            this.blueprintConfig.codegen = 'liquibase';
                        }
                    } else if (this.blueprintConfig.codegen === 'liquibase' && semver.lt(this.jooqVersion, '3.13.0')) {
                        this.warning(
                            `JOOQ version ${this.jooqVersion} doesn't supports liquibase, using version ${DEFAULT_JOOQ_VERSION} instead.`
                        );
                        this.jooqVersion = this.blueprintConfig.jooqVersion = DEFAULT_JOOQ_VERSION;
                    }
                },
            };
        }

        get default() {
            return {
                prepareForTemplates() {
                    this.jooqTargetName = `${this.jhipsterConfig.packageName}.jooq`;
                },
            };
        }

        get writing() {
            return {
                writeJooqFiles() {
                    this.renderTemplates(['README.jooq.md']);
                    if (this.jhipsterConfig.buildTool === 'maven') {
                        this.renderTemplates(['jooq.xml']);
                    }
                },
                injectJooqMavenConfigurations() {
                    if (this.jhipsterConfig.buildTool !== 'maven') return;
                    this.addMavenDependency('org.springframework.boot', 'spring-boot-starter-jooq');
                    this.addMavenProperty('jooq.version', this.jooqVersion);
                    this.addMavenPlugin('org.jooq', 'jooq-codegen-maven');
                    if (this.blueprintConfig.codegen === 'liquibase') {
                        // eslint-disable-next-line no-template-curly-in-string
                        const jooqVersion = '${jooq.version}';
                        this.addMavenDependency('org.jooq', 'jooq-meta-extensions', jooqVersion, '            <scope>compile</scope>');

                        // Match jooq version to meta-extensions
                        this.addMavenDependencyManagement('org.jooq', 'jooq', jooqVersion);

                        this.addMavenPluginManagement(
                            'org.jooq',
                            'jooq-codegen-maven',
                            undefined,
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
            };
        }

        _templateData() {
            return {
                jooqTargetName: this.jooqTargetName,
                codegen: this.blueprintConfig.codegen,
            };
        }
    };
}

module.exports = {
    createGenerator,
};
