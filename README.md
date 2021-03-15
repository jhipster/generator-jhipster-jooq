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

-   [Installing JHipster](https://www.jhipster.tech/installation/)

# Usage

To use this blueprint, run the below command

```bash
jhipster --blueprints jooq
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

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-jooq.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-jooq
[github-generator-image]: https://github.com/jhipster/generator-jhipster-jooq/workflows/Generator/badge.svg
[github-generator-url]: https://github.com/jhipster/generator-jhipster-tenantview/actions?query=workflow%3A%22Generator%22
[github-integration-image]: https://github.com/jhipster/generator-jhipster-jooq/workflows/Integration%20Test/badge.svg
[github-integration-url]: https://github.com/jhipster/generator-jhipster-tenantview/actions?query=workflow%3A%22Integration+Test%22
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-jooq.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-jooq
