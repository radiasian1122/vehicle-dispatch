const { faker } = require("@faker-js/faker");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
    let users = [];
    for (let i = 0; i <= 100; i++){
        let currentUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            company: 'C',
            platoon: `${faker.number.int({min: 1, max: 3})}C`
        }
    }
  await knex('users').insert([]);
};
