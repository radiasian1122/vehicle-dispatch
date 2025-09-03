const { faker } = require('@faker-js/faker')
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('qualifications_drivers').del()
    const qualDrivers = [];
    for (let i = 0; i < 200; i++){
        for (let j = 0; j < 9; i++){
            qualDrivers.push({
                driver_id: i + 1,
                qualification_id: j + 1
            })


        }
    }

  await knex('qualifications_drivers').insert(noDuplicates);
};
