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
        }

        get writing() {
            return {
                addJooqDependency() {
                    this.addMavenDependency('org.springframework.boot', 'spring-boot-starter-jooq');
                },
            };
        }
    };
}

module.exports = {
    createGenerator,
};
