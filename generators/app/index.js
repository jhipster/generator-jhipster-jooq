const chalk = require('chalk');

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
            this.option('jooq-gradle-plugin-version', {
                desc: 'Gradle plugin version to use',
                type: String,
            });
            this.option('jooq-optional', {
                desc: 'Make jOOQ repositories optional',
                type: Boolean,
            });

            // Create/override blueprintConfig, jhipsterConfig, and constants to keep jhipster 6 compatibility.
            this.blueprintStorage = this._getStorage();

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
            this.blueprintConfig = this.blueprintStorage.createProxy();
            this.jhipsterConfig = this._getStorage('generator-jhipster').createProxy();
            this.constants = this.constants || constants;

            if (this.options.jooqVersion) {
                this.blueprintConfig.jooqVersion = this.options.jooqVersion;
            }
            if (this.options.jooqOptional !== undefined) {
                this.blueprintConfig.jooqOptional = this.options.jooqOptional;
            }
            if (this.options.jooqGradlePluginVersion !== undefined) {
                this.blueprintConfig.jooqOptional = this.options.jooqGradlePluginVersion;
            }
        }

        notEmpty() {}
    };
}

module.exports = {
    createGenerator,
};
