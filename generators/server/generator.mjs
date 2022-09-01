import chalk from 'chalk';
import ServerGenerator from 'generator-jhipster/esm/generators/server';
import { PRIORITY_PREFIX, COMPOSING_PRIORITY } from 'generator-jhipster/esm/priorities';

export default class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, { taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    if (!this.options.jhipsterContext) {
      throw new Error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints jooq')}`);
    }

    this.sbsBlueprint = true;
  }

  /**
   * @returns {Record<string, (this: this): any>}
   */
  get [COMPOSING_PRIORITY]() {
    return {
      async composingTemplateTask() {
        await this.composeWithJHipster('jhipster-jooq:jooq');
      },
    };
  }
}
