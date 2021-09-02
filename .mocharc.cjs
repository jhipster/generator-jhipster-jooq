module.exports = {
    recursive: true,
    reporter: 'spec',
    slow: 0,
    timeout: 30000,
    ui: 'bdd',
    spec: ['**/*.spec.mjs', '**/*.spec.js'],
    require: 'mocha-expect-snapshot',
    parallel: true,
};
