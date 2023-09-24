## Description

The core API of Chainev

## Requirements

- Node JS v16+
- Docker

## Environment variables

Create your personal `.env` file using the `.env.example` file as a guide. For contributors, ensure to update the `.env.example` file with an empty version of any environment variable you create and use in the project. This will help other contributors stay updated on env variables.

## Dependencies

The program currently relies on the following dependencies

- Postgres
- Redis

Both Postgres and Redis are provisioned in the `docker-compose.yml` file at the root directory.
The postgres container exposes port `15432` instead of the defualt `5432`. This is to prevent clashes with any postgres instance that may be running on your machine.

## Installation

```bash
$ npm install
```

## Migrations and Seeds

This project uses Typeorm.

- #### Migrations:

  Typeorm allows you to generate a migration file based on the latest changes made to the entities in the project. Run the following command to generate a new migration:

  ```bash
  $ ./node_modules/.bin/ts-node ./node_modules/.bin/typeorm migration:generate -n NameFoYourNewMigration -c default -d src/database/migrations
  ```

  Replace `NameFoYourNewMigration` in the above command with a suitable name for your migration. It is best practice to have migration files with as few operations as possible.

  <br>

  To run pending migrations, run the following command:

  ```bash
  $ npm run migrations
  ```

- #### Seeds:

  Use the following command to generate a seed file:

  ```bash
  $ npm run seeders:generate NameFoYourNewSeedFile
  ```

  Replace `NameFoYourNewSeedFile` in the above command with a suitable name for your seed file.

  <br>

  You can run pending seeders with the following command:

  ```bash
  $ npm run seeders
  ```

For more information on migrations and seeds, see the `Typeorm` and `typeorm-seeding` docs, respectively.

## Running the app

Before you run the application, ensure to start the dependencies already setup in the docker-compose.yml file by running the following command:

```bash
$ docker-compose up -d
```

The `-d` flag runs starts the containers in detached mode. On a Linux and Unix-like machine, `sudo` may be required.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
