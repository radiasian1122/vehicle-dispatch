/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('qualifications').del()
    await knex('qualifications').insert([
        {qualification: 'JLTV'},
        {qualification: '1.1'},
        {qualification: 'STRYKER'},
        {qualification: 'MRZR'},
        {qualification: 'ISV'},
        {qualification: 'LMTV'},
        {qualification: 'TLC'},
        {qualification: 'RFSS'},
        {qualification: 'QUAD'}
    ]);
};
