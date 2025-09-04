const { faker } = require('@faker-js/faker')
const {generateDrivers} = require('../utils.js')
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('qualifications_drivers').del()
  await knex('qualifications_drivers').insert(generateDrivers());
};
