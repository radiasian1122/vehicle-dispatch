/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('dispatch').del()
  await knex('dispatch').insert({
      vehicle_id: 1,
      user_id: 1,
      driver_id: 1,
      sign_out: 111111,
      sign_in: 111111,
      status: 'pending'
  });
};
