/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('dispatch', table => {
      table.increments()
      table.integer('vehicle_id')
      table.foreign('vehicle_id').references('vehicles.id').deferrable('deferred')
      table.integer('user_id')
      table.foreign('user_id').references('users.id').deferrable('deferred')
      table.integer('driver_id')
      table.foreign('driver_id').references('drivers.id').deferrable('deferred')
      table.integer('sign_out')
      table.integer('sign_in')
      table.string('status')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('dispatch', table => {
      table.dropForeign('vehicle_id')
      table.dropForeign('user_id')
      table.dropForeign('driver_id')
  })
      .then( () => {
          return knex.schema.dropTableIfExists('dispatch')
      })
};
