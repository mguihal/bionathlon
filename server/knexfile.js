// Update with your config settings.

require('dotenv').config();

console.log(process.env);

module.exports = {
  default: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
