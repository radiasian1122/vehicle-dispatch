// knexfile.js
/** @type { Object.<string, import("knex").Knex.Config> } */
module.exports = {
  development: {
    client: "pg",
    connection: "postgres://postgres:docker@localhost:5432/backend-db",
  },
  docker: {
    client: "pg",
    connection: "postgres://postgres:docker@database:5432/backend-db",
  },
};
