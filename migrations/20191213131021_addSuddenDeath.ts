import Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.table('game', table => {
    table.boolean('suddenDeath').notNullable().defaultTo(false);
  });
}


export async function down(knex: Knex): Promise<any> {
  return knex.schema.table('game', table => {
    table.dropColumn('suddenDeath');
  });
}
