// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    connection: "pg://postgres:docker@localhost:5432/backend-db",
  },

  docker: {
    client: "pg",
    connection: "pg://postgres:docker@database:5432/backend-db",
  },
};
