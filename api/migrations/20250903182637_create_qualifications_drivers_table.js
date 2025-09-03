/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('qualifications_drivers', table => {
      table.increments()
      table.integer('driver_id')
      table.foreign('driver_id').references('drivers.id').deferrable('deferred')
      table.integer('vehicle_id')
      table.foreign('vehicle_id').references('vehicles.id').deferrable('deferred')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('qualifications_drivers', table => {
        table.dropForeign('driver_id')
        table.dropForeign('vehicle_id')
    })
        .then( () => {
            return knex.schema.dropTableIfExists('qualifications_drivers')
        })
};
