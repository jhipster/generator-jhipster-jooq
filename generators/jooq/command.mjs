import { asCommand } from 'generator-jhipster';

export default asCommand({
  configs: {
    jooqVersion: {
      description: 'Use jOOQ version',
      type: String,
      scope: 'blueprint',
    },
    jooqOptional: {
      description: 'Make jOOQ repositories optional',
      type: Boolean,
      scope: 'blueprint',
    },
  },
});
