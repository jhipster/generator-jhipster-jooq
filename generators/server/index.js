/* eslint-disable consistent-return */
const chalk = require('chalk');

function createGenerator(env) {
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

            this.configOptions = jhContext.configOptions || {};

            if (!this.blueprintStorage) {
                this.blueprintStorage = this._getStorage();
                this.blueprintConfig = this.blueprintStorage.createProxy();
            }
        }

        get configuring() {
            return {
                configureJooq() {
                    if (this.blueprintConfig.codeGenerator === undefined) {
                        this.blueprintConfig.codeGenerator = 'liquibase';
                    }
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
                    this.addMavenProperty('jooq-meta-extensions.version', '3.12.4');
                    this.addMavenPlugin('org.jooq', 'jooq-codegen-maven');
                    if (this.blueprintConfig.codeGenerator === 'liquibase') {
                        this.addMavenDependency(
                            'org.jooq',
                            'jooq-meta-extensions',
                            '${jooq-meta-extensions.version}',
                            '            <scope>compile</scope>'
                        );
                        this.addMavenPluginManagement(
                            'org.jooq',
                            'jooq-codegen-maven',
                            undefined,
                            `                <configuration>
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
    };
}

module.exports = {
    createGenerator,
};
