import chalk from 'chalk';
import { GeneratorBaseBlueprint } from 'generator-jhipster';
import { PRIORITY_PREFIX } from 'generator-jhipster/esm/priorities';

export default class extends GeneratorBaseBlueprint {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

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
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint generator-jhipster-jooq')}`
      );
    }

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

  [`${PRIORITY_PREFIX}notEmpty`]() {}
}
