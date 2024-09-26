import { asCommand } from 'generator-jhipster';

export default asCommand({
  options: {
    jooqVersion: {
      description: 'Use jOOQ version',
      type: String,
      scope: 'blueprint',
    },
    jooqGradlePluginVersion: {
      description: 'Gradle plugin version to use',
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
