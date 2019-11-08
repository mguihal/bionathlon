import Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex('game').truncate();

  await knex.schema.table('game', table => {
    table.dropColumn('date');
  });

  return knex.schema.table('game', table => {
    table.date('date').notNullable();
    table.string('time').notNullable();

    table.unique(['playerId', 'date', 'time']);
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex('game').truncate();

  await knex.schema.table('game', table => {
    table.dropIndex(['playerId', 'date', 'time']);

    table.dropColumn('time');
    table.dropColumn('date');
  });

  return knex.schema.table('game', table => {
    table.dateTime('date').notNullable();
  });
}
