require("dotenv").config();
const express = require("express");
const cors = require("cors");

// --- DB (Knex) ---------------------------------------------
const knexConfig = require("./knexfile")[process.env.NODE_ENV || "development"];
const db = require("knex")(knexConfig);

// --- App ---------------------------------------------------
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Small helper
const now = () => db.fn.now();

// -----------------------------------------------------------
// HEALTHCHECK
// -----------------------------------------------------------
app.get("/health", async (req, res) => {
  try {
    await db.select(db.raw("1+1 as ok")).first();
    res.json({ ok: true, env: process.env.NODE_ENV || "development" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "DB not reachable" });
  }
});

// ===========================================================
// USERS
// ===========================================================
app.get("/users", async (_req, res) => {
  try {
    const rows = await db("users").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const row = await db("users").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      company,
      platoon,
      role,
      username,
      password,
    } = req.body;
    const [created] = await db("users")
      .insert({
        first_name,
        last_name,
        company,
        platoon,
        role,
        username,
        password,
      })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const [updated] = await db("users")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const count = await db("users").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete user" });
  }
});

// ===========================================================
// DRIVERS
// ===========================================================
app.get("/drivers", async (_req, res) => {
  try {
    const rows = await db("drivers").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.get("/drivers/:id", async (req, res) => {
  try {
    const row = await db("drivers").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

app.post("/drivers", async (req, res) => {
  try {
    const { license_number, status, first_name, last_name, company } = req.body;
    const [created] = await db("drivers")
      .insert({ license_number, status, first_name, last_name, company })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create driver" });
  }
});

app.patch("/drivers/:id", async (req, res) => {
  try {
    const [updated] = await db("drivers")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update driver" });
  }
});

app.delete("/drivers/:id", async (req, res) => {
  try {
    const count = await db("drivers").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete driver" });
  }
});

// Driver qualifications (join table)
app.get("/drivers/:id/qualifications", async (req, res) => {
  try {
    const rows = await db("qualifications_drivers as qd")
      .join("qualifications as q", "qd.qualification_id", "q.id")
      .select("q.id", "q.qualification")
      .where("qd.driver_id", req.params.id)
      .orderBy("q.qualification");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch driver qualifications" });
  }
});

app.post("/drivers/:id/qualifications", async (req, res) => {
  try {
    const { qualification_id } = req.body;
    const [created] = await db("qualifications_drivers")
      .insert({ driver_id: req.params.id, qualification_id })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to add qualification to driver" });
  }
});

app.delete(
  "/drivers/:id/qualifications/:qualification_id",
  async (req, res) => {
    try {
      const count = await db("qualifications_drivers")
        .where({
          driver_id: req.params.id,
          qualification_id: req.params.qualification_id,
        })
        .del();
      if (!count) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    } catch (e) {
      res
        .status(400)
        .json({ error: "Failed to remove qualification from driver" });
    }
  }
);

// ===========================================================
// VEHICLES
// ===========================================================
app.get("/vehicles", async (_req, res) => {
  try {
    const rows = await db("vehicles").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

app.get("/vehicles/:id", async (req, res) => {
  try {
    const row = await db("vehicles").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

app.post("/vehicles", async (req, res) => {
  try {
    const { type, callsign, company, status } = req.body;
    const [created] = await db("vehicles")
      .insert({ type, callsign, company, status })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create vehicle" });
  }
});

app.patch("/vehicles/:id", async (req, res) => {
  try {
    const [updated] = await db("vehicles")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update vehicle" });
  }
});

app.delete("/vehicles/:id", async (req, res) => {
  try {
    const count = await db("vehicles").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete vehicle" });
  }
});

// ===========================================================
// QUALIFICATIONS (catalog)
// ===========================================================
app.get("/qualifications", async (_req, res) => {
  try {
    const rows = await db("qualifications").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch qualifications" });
  }
});

app.post("/qualifications", async (req, res) => {
  try {
    const { qualification } = req.body;
    const [created] = await db("qualifications")
      .insert({ qualification })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create qualification" });
  }
});

app.delete("/qualifications/:id", async (req, res) => {
  try {
    const count = await db("qualifications").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete qualification" });
  }
});

// ===========================================================
// DISPATCH
// ===========================================================

// List all dispatch records (optionally filter active)
app.get("/dispatch", async (req, res) => {
  try {
    const { active } = req.query;
    const q = db("dispatch as d")
      .leftJoin("vehicles as v", "d.vehicle_id", "v.id")
      .leftJoin("drivers as dr", "d.driver_id", "dr.id")
      .leftJoin("users as u", "d.user_id", "u.id")
      .select(
        "d.id",
        "d.vehicle_id",
        "d.driver_id",
        "d.user_id",
        "d.sign_out",
        "d.sign_in",
        "v.callsign as vehicle_callsign",
        "v.type as vehicle_type",
        "dr.first_name as driver_first_name",
        "dr.last_name as driver_last_name",
        "u.username as dispatcher_username"
      )
      .orderBy("d.id", "desc");

    if (active === "true") q.whereNull("d.sign_in");
    const rows = await q;
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch dispatch records" });
  }
});

// Sign a vehicle OUT (create a dispatch row)
app.post("/dispatch/signout", async (req, res) => {
  try {
    const { vehicle_id, driver_id, user_id } = req.body;

    // Optional guard: prevent double-signout on same vehicle
    const existing = await db("dispatch")
      .where({ vehicle_id })
      .whereNull("sign_in")
      .first();
    if (existing)
      return res
        .status(409)
        .json({ error: "Vehicle already dispatched (no sign-in yet)" });

    const [created] = await db("dispatch")
      .insert({
        vehicle_id,
        driver_id,
        user_id,
        sign_out: now(),
        sign_in: null,
      })
      .returning("*");

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to sign out vehicle" });
  }
});

// Sign a vehicle IN (close a dispatch row)
app.patch("/dispatch/:id/signin", async (req, res) => {
  try {
    const [updated] = await db("dispatch")
      .where({ id: req.params.id })
      .whereNull("sign_in")
      .update({ sign_in: now() })
      .returning("*");

    if (!updated)
      return res.status(404).json({ error: "Active dispatch not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to sign in vehicle" });
  }
});

// Convenience: who is currently out, with qualifications for the driver
app.get("/dispatch/active/details", async (_req, res) => {
  try {
    const rows = await db("dispatch as d")
      .join("vehicles as v", "d.vehicle_id", "v.id")
      .join("drivers as dr", "d.driver_id", "dr.id")
      .leftJoin("users as u", "d.user_id", "u.id")
      .whereNull("d.sign_in")
      .select(
        "d.id as dispatch_id",
        "d.sign_out",
        "v.id as vehicle_id",
        "v.callsign",
        "v.type",
        "v.company as vehicle_company",
        "dr.id as driver_id",
        "dr.first_name",
        "dr.last_name",
        "dr.status as driver_status",
        "u.username as dispatcher_username"
      )
      .orderBy("d.sign_out", "desc");

    // Attach quals
    const driverIds = rows.map((r) => r.driver_id);
    const quals = await db("qualifications_drivers as qd")
      .join("qualifications as q", "qd.qualification_id", "q.id")
      .whereIn("qd.driver_id", driverIds)
      .select("qd.driver_id", "q.qualification");

    const grouped = driverIds.reduce((acc, id) => {
      acc[id] = [];
      return acc;
    }, {});
    for (const q of quals) grouped[q.driver_id]?.push(q.qualification);

    res.json(
      rows.map((r) => ({
        ...r,
        qualifications: grouped[r.driver_id] || [],
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch active dispatch details" });
  }
});

// ===========================================================
// SERVER START
// ===========================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `API running on port ${PORT} (env=${
        process.env.NODE_ENV || "development"
      })`
    );
  });
}

module.exports = app;

// -----------------------------------------------------------
// HEALTHCHECK
// -----------------------------------------------------------
app.get("/health", async (req, res) => {
  try {
    await db.select(db.raw("1+1 as ok")).first();
    res.json({ ok: true, env: process.env.NODE_ENV || "development" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "DB not reachable" });
  }
});

// ===========================================================
// USERS
// ===========================================================
app.get("/users", async (_req, res) => {
  try {
    const rows = await db("users").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const row = await db("users").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      company,
      platoon,
      role,
      username,
      password,
    } = req.body;
    const [created] = await db("users")
      .insert({
        first_name,
        last_name,
        company,
        platoon,
        role,
        username,
        password,
      })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const [updated] = await db("users")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const count = await db("users").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete user" });
  }
});

// ===========================================================
// DRIVERS
// ===========================================================
app.get("/drivers", async (_req, res) => {
  try {
    const rows = await db("drivers").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.get("/drivers/:id", async (req, res) => {
  try {
    const row = await db("drivers").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

app.post("/drivers", async (req, res) => {
  try {
    const { license_number, status, first_name, last_name, company } = req.body;
    const [created] = await db("drivers")
      .insert({ license_number, status, first_name, last_name, company })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create driver" });
  }
});

app.patch("/drivers/:id", async (req, res) => {
  try {
    const [updated] = await db("drivers")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update driver" });
  }
});

app.delete("/drivers/:id", async (req, res) => {
  try {
    const count = await db("drivers").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete driver" });
  }
});

// Driver qualifications (join table)
app.get("/drivers/:id/qualifications", async (req, res) => {
  try {
    const rows = await db("qualifications_drivers as qd")
      .join("qualifications as q", "qd.qualification_id", "q.id")
      .select("q.id", "q.qualification")
      .where("qd.driver_id", req.params.id)
      .orderBy("q.qualification");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch driver qualifications" });
  }
});

app.post("/drivers/:id/qualifications", async (req, res) => {
  try {
    const { qualification_id } = req.body;
    const [created] = await db("qualifications_drivers")
      .insert({ driver_id: req.params.id, qualification_id })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to add qualification to driver" });
  }
});

app.delete(
  "/drivers/:id/qualifications/:qualification_id",
  async (req, res) => {
    try {
      const count = await db("qualifications_drivers")
        .where({
          driver_id: req.params.id,
          qualification_id: req.params.qualification_id,
        })
        .del();
      if (!count) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    } catch (e) {
      res
        .status(400)
        .json({ error: "Failed to remove qualification from driver" });
    }
  }
);

// ===========================================================
// VEHICLES
// ===========================================================
app.get("/vehicles", async (_req, res) => {
  try {
    const rows = await db("vehicles").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

app.get("/vehicles/:id", async (req, res) => {
  try {
    const row = await db("vehicles").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

app.post("/vehicles", async (req, res) => {
  try {
    const { type, callsign, company, status } = req.body;
    const [created] = await db("vehicles")
      .insert({ type, callsign, company, status })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create vehicle" });
  }
});

app.patch("/vehicles/:id", async (req, res) => {
  try {
    const [updated] = await db("vehicles")
      .where({ id: req.params.id })
      .update(req.body)
      .returning("*");
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to update vehicle" });
  }
});

app.delete("/vehicles/:id", async (req, res) => {
  try {
    const count = await db("vehicles").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete vehicle" });
  }
});

// ===========================================================
// QUALIFICATIONS (catalog)
// ===========================================================
app.get("/qualifications", async (_req, res) => {
  try {
    const rows = await db("qualifications").select("*").orderBy("id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch qualifications" });
  }
});

app.post("/qualifications", async (req, res) => {
  try {
    const { qualification } = req.body;
    const [created] = await db("qualifications")
      .insert({ qualification })
      .returning("*");
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to create qualification" });
  }
});

app.delete("/qualifications/:id", async (req, res) => {
  try {
    const count = await db("qualifications").where({ id: req.params.id }).del();
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: "Failed to delete qualification" });
  }
});

// ===========================================================
// DISPATCH
// ===========================================================

// List all dispatch records (optionally filter active)
app.get("/dispatch", async (req, res) => {
  try {
    const { active } = req.query;
    const q = db("dispatch as d")
      .leftJoin("vehicles as v", "d.vehicle_id", "v.id")
      .leftJoin("drivers as dr", "d.driver_id", "dr.id")
      .leftJoin("users as u", "d.user_id", "u.id")
      .select(
        "d.id",
        "d.vehicle_id",
        "d.driver_id",
        "d.user_id",
        "d.sign_out",
        "d.sign_in",
        "v.callsign as vehicle_callsign",
        "v.type as vehicle_type",
        "dr.first_name as driver_first_name",
        "dr.last_name as driver_last_name",
        "u.username as dispatcher_username"
      )
      .orderBy("d.id", "desc");

    if (active === "true") q.whereNull("d.sign_in");
    const rows = await q;
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch dispatch records" });
  }
});

// Sign a vehicle OUT (create a dispatch row)
app.post("/dispatch/signout", async (req, res) => {
  try {
    const { vehicle_id, driver_id, user_id } = req.body;

    // Optional guard: prevent double-signout on same vehicle
    const existing = await db("dispatch")
      .where({ vehicle_id })
      .whereNull("sign_in")
      .first();
    if (existing)
      return res
        .status(409)
        .json({ error: "Vehicle already dispatched (no sign-in yet)" });

    const [created] = await db("dispatch")
      .insert({
        vehicle_id,
        driver_id,
        user_id,
        sign_out: now(),
        sign_in: null,
      })
      .returning("*");

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Failed to sign out vehicle" });
  }
});

// Sign a vehicle IN (close a dispatch row)
app.patch("/dispatch/:id/signin", async (req, res) => {
  try {
    const [updated] = await db("dispatch")
      .where({ id: req.params.id })
      .whereNull("sign_in")
      .update({ sign_in: now() })
      .returning("*");

    if (!updated)
      return res.status(404).json({ error: "Active dispatch not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Failed to sign in vehicle" });
  }
});

// Convenience: who is currently out, with qualifications for the driver
app.get("/dispatch/active/details", async (_req, res) => {
  try {
    const rows = await db("dispatch as d")
      .join("vehicles as v", "d.vehicle_id", "v.id")
      .join("drivers as dr", "d.driver_id", "dr.id")
      .leftJoin("users as u", "d.user_id", "u.id")
      .whereNull("d.sign_in")
      .select(
        "d.id as dispatch_id",
        "d.sign_out",
        "v.id as vehicle_id",
        "v.callsign",
        "v.type",
        "v.company as vehicle_company",
        "dr.id as driver_id",
        "dr.first_name",
        "dr.last_name",
        "dr.status as driver_status",
        "u.username as dispatcher_username"
      )
      .orderBy("d.sign_out", "desc");

    // Attach quals
    const driverIds = rows.map((r) => r.driver_id);
    const quals = await db("qualifications_drivers as qd")
      .join("qualifications as q", "qd.qualification_id", "q.id")
      .whereIn("qd.driver_id", driverIds)
      .select("qd.driver_id", "q.qualification");

    const grouped = driverIds.reduce((acc, id) => {
      acc[id] = [];
      return acc;
    }, {});
    for (const q of quals) grouped[q.driver_id]?.push(q.qualification);

    res.json(
      rows.map((r) => ({
        ...r,
        qualifications: grouped[r.driver_id] || [],
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch active dispatch details" });
  }
});

// ===========================================================
// SERVER START
// ===========================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `API running on port ${PORT} (env=${
        process.env.NODE_ENV || "development"
      })`
    );
  });
}

module.exports = app;
