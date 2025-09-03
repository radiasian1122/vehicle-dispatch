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
        const fakerFirstName = faker.person.firstName();
        const fakerLastName = faker.person.lastName();
        let currentUser = {
            first_name: fakerFirstName,
            last_name: fakerLastName,
            company: 'C',
            platoon: `${faker.number.int({min: 1, max: 3})}C`,
            role: 'user',
            username:`${fakerFirstName.toLowerCase()}-${fakerLastName.toLowerCase()}`,
            password: 'password'
        }

        users.push(currentUser);
    }
  await knex('users').insert(users);
};
