import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('You must configure database connection string in a .env file');
  console.error('DATABASE_URL=postgresql://user:password@host:port/database');
}

export const master = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'ts',
  },
};
