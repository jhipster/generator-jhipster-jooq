const chalk = require('chalk');

function createGenerator(env) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const constants = require(`${env.getPackagePath('jhipster:server')}/generators/generator-constants`);
    return class extends env.requireGenerator('jhipster:server') {
        constructor(args, opts, features) {
            super(args, opts, features);

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

            if (this.options.help) return;

            this.sbsBlueprint = true;

            if (!this.options.jhipsterContext) {
                throw new Error(
                    `This is a JHipster blueprint and should be used only like ${chalk.yellow(
                        'jhipster --blueprint generator-jhipster-jooq'
                    )}`
                );
            }

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
