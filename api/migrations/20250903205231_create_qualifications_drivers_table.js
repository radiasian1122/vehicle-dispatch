/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('qualifications_drivers', table => {
        table.increments()
        table.integer('driver_id')
        table.foreign('driver_id').references('drivers.id').deferrable('deferred')
        table.integer('qualification_id')
        table.foreign('qualification_id').references('qualifications.id').deferrable('deferred')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('qualifications_drivers', table => {
        table.dropForeign('driver_id')
        table.dropForeign('qualification_id')
    })
        .then( () => {
            return knex.schema.dropTableIfExists('qualifications_drivers')
        })
};
