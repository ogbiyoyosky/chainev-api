module.exports = {
  name: 'default',
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [__dirname, 'src/**/*.entity.ts'],
  database: process.env.DATABASE_NAME,
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['dist/**/*.subscriber.js'],
  seeds: ['src/database/seeders/*.ts'],
  cli: {
    migrationsDir: ['src/database/migrations'],
    seedersDir: ['src/database/seeders'],
    useTypescript: true,
  },
  migrationsTableName: 'migrations',
};
