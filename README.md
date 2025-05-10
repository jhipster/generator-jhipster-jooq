# generator-jhipster-jooq

> JHipster blueprint, jOOQ blueprint for JHipster

[![NPM version][npm-image]][npm-url]
[![Generator][github-generator-image]][github-generator-url]
[![Samples][github-samples-image]][github-samples-url]

# Introduction

This is a [JHipster](https://www.jhipster.tech/) blueprint, that is meant to be used in a JHipster application.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster basic knowledge:

- [JHipster](https://www.jhipster.tech/)

# Installation

To install or update this blueprint:

```bash
npm install -g generator-jhipster-jooq
```

# Usage

To use this blueprint, run the below command

```bash
jhipster-jooq
```

You can look for updated jooq blueprint specific options by running

```bash
jhipster-jooq app --help
```

And looking for `(blueprint option: jooq)` like

```
  --jooq-version <value>                Use jOOQ version (blueprint option: jooq)
  --jooq-gradle-plugin-version <value>  Gradle plugin version to use (blueprint option: jooq)
  --jooq-optional                       Make jOOQ repositories optional (blueprint option: jooq)
```

## Using Docker

Download the Dockerfile:

```bash
mkdir docker
cd docker
wget https://github.com/jhipster/generator-jhipster-jooq/raw/master/docker/Dockerfile
```

Build the Docker images:

```bash
docker build -t jhipster-generator-jooq:latest .
```

Make a folder where you want to generate the Service:

```bash
mkdir service
cd service
```

Run the generator from image to generate service:

```bash
docker run -it --rm -v $PWD:/home/jhipster/app jhipster-generator-jooq
```

Run and attach interactive shell to the generator docker container to work from inside the running container:

```bash
docker run -it --rm -v $PWD:/home/jhipster/app jhipster-generator-jooq /bin/bash
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
[github-generator-image]: https://github.com/jhipster/generator-jhipster-jooq/actions/workflows/generator.yml/badge.svg
[github-generator-url]: https://github.com/jhipster/generator-jhipster-jooq/actions/workflows/generator.yml
[github-samples-image]: https://github.com/jhipster/generator-jhipster-jooq/actions/workflows/samples.yml/badge.svg
[github-samples-url]: https://github.com/jhipster/generator-jhipster-jooq/actions/workflows/samples.yml
