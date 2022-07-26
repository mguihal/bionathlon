import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable('player', table => {
    table.increments('id');
    table
      .text('email')
      .notNullable()
      .unique();
    table.text('name').notNullable();
  });

  return knex.schema.createTable('game', table => {
    table.increments('id');
    table
      .integer('playerId')
      .unsigned()
      .notNullable();
    table.dateTime('date').notNullable();
    table.integer('score').notNullable();
    table.text('note');

    table
      .foreign('playerId')
      .references('id')
      .inTable('player');
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTableIfExists('game');
  return knex.schema.dropTableIfExists('player');
}
