const { faker } = require('@faker-js/faker')
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('drivers').del()
    let drivers = [];
  for (let i = 0; i <= 200; i++){
      let currentDriver = {
          license_number: faker.vehicle.vin(),
          status: "Current",
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          company: "C"
      }
      drivers.push(currentDriver)
  }
  await knex('drivers').insert(drivers);
};
