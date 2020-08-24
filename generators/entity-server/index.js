const chalk = require('chalk');

function createGenerator(env) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const constants = require(`${env.getPackagePath('jhipster:entity-server')}/generators/generator-constants`);
    return class extends env.requireGenerator('jhipster:entity-server') {
        constructor(args, opts) {
            super(args, opts); // fromBlueprint variable is important

            this.sbsBlueprint = true;

            if (this.options.help) return;

            const jhContext = (this.context = opts.context);

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

            this.constants = this.constants || constants;
        }

        get default() {
            return {
                loadConfig() {
                    this.jooqGeneratedClassName = this.context.entityClass;
                    this.jooqGeneratedEntityReference = this._.snakeCase(this.context.entityClass).toUpperCase();
                    this.jooqTargetName = `${this.jhipsterConfig.packageName}.jooq`;
                },
            };
        }

        get writing() {
            return {
                writeJooqEntityFiles() {
                    this.renderTemplate(
                        `${this.constants.SERVER_MAIN_SRC_DIR}package/repository/JOOQRepositoryImpl.java.ejs`,
                        `${this.constants.SERVER_MAIN_SRC_DIR}${this.jhipsterConfig.packageFolder}/repository/${this.context.entityClass}JOOQRepositoryImpl.java`
                    );
                    this.renderTemplate(
                        `${this.constants.SERVER_MAIN_SRC_DIR}package/repository/JOOQRepository.java.ejs`,
                        `${this.constants.SERVER_MAIN_SRC_DIR}${this.jhipsterConfig.packageFolder}/repository/${this.context.entityClass}JOOQRepository.java`
                    );
                },
            };
        }

        _templateData() {
            return {
                jooqTargetName: this.jooqTargetName,
                jooqGeneratedClassName: this.jooqGeneratedClassName,
                jooqGeneratedEntityReference: this.jooqGeneratedEntityReference,
                packageName: this.jhipsterConfig.packageName,
                ...this.context,
            };
        }
    };
}

module.exports = {
    createGenerator,
};
