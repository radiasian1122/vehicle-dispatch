/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('drivers', table => {
      table.increments()
      table.string("license_number")
      table.string("status")
      table.string('first_name')
      table.string('last_name')
      table.string('company')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('drivers');
};
