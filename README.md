# generator-jhipster-jooq

> JHipster blueprint, jOOQ blueprint for JHipster

[![NPM version][npm-image]][npm-url]
[![Generator][github-generator-image]][github-generator-url]
[![Integration Test][github-integration-image]][github-integration-url]
[![Dependency Status][daviddm-image]][daviddm-url]

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

# Usage

To use this blueprint, run the below command

```bash
jhipster --blueprints jooq
```

You can look for updated jooq blueprint specific options by running

```bash
jhipster app --blueprints jooq --help
```

And looking for `(blueprint option: jooq)` like

```
  --jooq-version <value>                Use jOOQ version (blueprint option: jooq)
  --jooq-gradle-plugin-version <value>  Gradle plugin version to use (blueprint option: jooq)
  --jooq-optional                       Make jOOQ repositories optional (blueprint option: jooq)
```

## Pre-release

To use an unreleased version, install it using git.

```bash
npm install -g jhipster/generator-jhipster-jooq#main
jhipster --blueprints jooq --skip-jhipster-dependencies
```

# Features

- Dependencies are added automatically.

Dependencies are added to your favorite build tool (maven or gradle).

- Repository interface.

A jOOQ repository interface is created for every (or opt-in/opt-out) entity.

- Repository implementation.

A jOOQ repository implementation with DSLContext (jOOQ) is created for every (or opt-in/opt-out) entity.

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-jooq.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-jooq
[github-generator-image]: https://github.com/jhipster/generator-jhipster-jooq/workflows/Generator/badge.svg
[github-generator-url]: https://github.com/jhipster/generator-jhipster-tenantview/actions?query=workflow%3A%22Generator%22
[github-integration-image]: https://github.com/jhipster/generator-jhipster-jooq/workflows/Integration%20Test/badge.svg
[github-integration-url]: https://github.com/jhipster/generator-jhipster-tenantview/actions?query=workflow%3A%22Integration+Test%22
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-jooq.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-jooq
