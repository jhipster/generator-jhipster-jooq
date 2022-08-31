import chalk from 'chalk';
import { constants } from 'generator-jhipster';
import EntityServerGenerator from 'generator-jhipster/generators/entity-server';
import { PRIORITY_PREFIX } from 'generator-jhipster/esm/priorities';

export default class JooqEntityGenerator extends EntityServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features); // fromBlueprint variable is important

    this.sbsBlueprint = true;

    this.option('jooq', {
      desc: 'Create jOOQ repository for this entity',
      type: Boolean,
    });

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

    if (!this.entity) {
      throw new Error(
        `This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint generator-jhipster-jooq')}`
      );
    }

    this.constants = this.constants || constants;
    this.entityName = this._.upperFirst(this.entity.name);

    this.entityStorage = this.createStorage(this.destinationPath(this.constants.JHIPSTER_CONFIG_DIR, `${this.entityName}.json`));
    this.entityConfig = this.entityStorage.createProxy();
  }

  [`${PRIORITY_PREFIX}notEmpty`]() {}
}
