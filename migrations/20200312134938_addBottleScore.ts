import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('game', (table) => {
    table.integer('score').alter();
    table.integer('scoreLeftBottle');
    table.integer('scoreMiddleBottle');
    table.integer('scoreRightBottle');
    table.integer('scoreMalusBottle');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('game', (table) => {
    table.dropColumn('scoreLeftBottle');
    table.dropColumn('scoreMiddleBottle');
    table.dropColumn('scoreRightBottle');
    table.dropColumn('scoreMalusBottle');
    table.integer('score').notNullable().alter();
  });
}
