
exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE "player" (
      "id" UUID NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL
    );
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE "player";
  `);
};
