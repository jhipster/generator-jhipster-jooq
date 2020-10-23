const chalk = require('chalk');

function createGenerator(env) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const constants = require(`${env.getPackagePath('jhipster:entity-server')}/generators/generator-constants`);
    return class extends env.requireGenerator('jhipster:entity-server') {
        constructor(args, opts) {
            super(args, opts); // fromBlueprint variable is important

            this.sbsBlueprint = true;

            this.option('jooq', {
                desc: 'Create jOOQ repository for this entity',
                type: Boolean,
            });

            // Entity context
            this.context = opts.context;
            this.entityName = this._.upperFirst(this.context.name);

            // Create/override blueprintConfig, jhipsterConfig, and constants to keep jhipster 6 compatibility.
            this.constants = this.constants || constants;

            this.blueprintConfig = this._getStorage().createProxy();
            this.jhipsterConfig = this._getStorage('generator-jhipster').createProxy();

            this.entityStorage = this.createStorage(this.destinationPath(this.constants.JHIPSTER_CONFIG_DIR, `${this.entityName}.json`));
            this.entityConfig = this.entityStorage.createProxy();

            // Add jooq to prompt/option.
            this.registerConfigPrompts({
                exportOption: {
                    desc: 'Create jOOQ repository for this entity',
                },
                type: 'confirm',
                when: () => !this.options.skipPrompts && this.blueprintConfig.jooqOptional,
                name: 'jooq',
                message: `Add jOOQ repository for ${this.entityName}?`,
                default: true,
                storage: this.entityStorage,
            });

            if (this.options.help) return;

            if (!this.context) {
                this.error(
                    `This is a JHipster blueprint and should be used only like ${chalk.yellow(
                        'jhipster --blueprint generator-jhipster-jooq'
                    )}`
                );
            }

            this.configOptions = opts.configOptions || {};
        }

        get configuring() {
            return {
                configure() {
                    // registerConfigPrompts sets value as null if prompt was skipped.
                    if (this.entityConfig.jooq === undefined || this.entityConfig.jooq === null) {
                        this.entityConfig.jooq = !this.blueprintConfig.jooqOptional;
                    }
                },
            };
        }

        get default() {
            return {
                loadConfig() {
                    if (!this.entityConfig.jooq) return;
                    const { upperFirst, camelCase } = this._;
                    this.jooqGeneratedClassName = upperFirst(camelCase(this.context.entityTableName));
                    this.jooqGeneratedEntityReference = this.context.entityTableName.toUpperCase();
                    this.jooqTargetName = `${this.jhipsterConfig.packageName}.jooq`;
                },
            };
        }

        get writing() {
            return {
                writeJooqEntityFiles() {
                    if (!this.entityConfig.jooq) return;
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

        /* Custom data to be passed to templates */
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
