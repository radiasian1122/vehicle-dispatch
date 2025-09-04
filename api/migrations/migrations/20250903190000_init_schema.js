/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  // USERS
  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("first_name", 255).notNullable();
    t.string("last_name", 255).notNullable();
    t.string("company", 255);
    t.string("platoon", 255);
    t.string("role", 255);
    t.string("username", 255).notNullable().unique();
    t.string("password", 255).notNullable(); // hash in app layer later
    t.timestamps(true, true);
  });

  // DRIVERS
  await knex.schema.createTable("drivers", (t) => {
    t.increments("id").primary();
    t.string("license_number", 255).notNullable().unique();
    t.string("status", 255).notNullable(); // e.g. ACTIVE / INACTIVE / SUSPENDED
    t.string("first_name", 255).notNullable();
    t.string("last_name", 255).notNullable();
    t.string("company", 255);
    t.timestamps(true, true);
  });

  // VEHICLES
  await knex.schema.createTable("vehicles", (t) => {
    t.increments("id").primary();
    t.string("type", 255).notNullable(); // e.g. SUV, Sedan, Truck
    t.string("callsign", 255).notNullable().unique();
    t.string("company", 255);
    t.string("status", 255).notNullable(); // e.g. AVAILABLE / MAINT / OUT
    t.timestamps(true, true);
  });

  // QUALIFICATIONS (catalog)
  await knex.schema.createTable("qualifications", (t) => {
    t.increments("id").primary();
    t.string("qualification", 255).notNullable().unique(); // e.g. EVOC, MEDIC
    t.timestamps(true, true);
  });

  // QUALIFICATIONS_DRIVERS (junction)
  await knex.schema.createTable("qualifications_drivers", (t) => {
    t.increments("id").primary();
    t.integer("driver_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("drivers")
      .onDelete("CASCADE")
      .index();
    t.integer("qualification_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("qualifications")
      .onDelete("CASCADE")
      .index();

    // a driver can only have a qualification once
    t.unique(["driver_id", "qualification_id"]);
    t.timestamps(true, true);
  });

  // DISPATCH
  await knex.schema.createTable("dispatch", (t) => {
    t.increments("id").primary();

    t.integer("vehicle_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("vehicles")
      .onDelete("RESTRICT") // don’t delete active history if a vehicle is removed
      .index();

    t.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT")
      .index();

    t.integer("driver_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("drivers")
      .onDelete("RESTRICT")
      .index();

    // timestamps for out/in
    t.timestamp("sign_out", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.timestamp("sign_in", { useTz: true }).nullable();

    t.timestamps(true, true);
  });

  // Helpful composite index for “who’s out now?”
  await knex.schema.alterTable("dispatch", (t) => {
    t.index(["vehicle_id", "sign_in"]);
    t.index(["driver_id", "sign_in"]);
    t.index(["sign_in"]); // NULL = active
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  // Drop in reverse order of dependencies
  await knex.schema.dropTableIfExists("dispatch");
  await knex.schema.dropTableIfExists("qualifications_drivers");
  await knex.schema.dropTableIfExists("qualifications");
  await knex.schema.dropTableIfExists("vehicles");
  await knex.schema.dropTableIfExists("drivers");
  await knex.schema.dropTableIfExists("users");
};
