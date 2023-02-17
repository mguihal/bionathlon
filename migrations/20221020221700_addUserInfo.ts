import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('player', (table) => {
    table.text('avatar');
    table.boolean('isAdmin').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('player', (table) => {
    table.dropColumn('avatar');
    table.dropColumn('isAdmin');
  });
}
