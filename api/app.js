const express = require("express");
const cors = require("cors");
const knex = require("knex")(require("./knexfile.js")["docker"]);

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Async handler to wrap async route functions and catch errors
const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function requireFields(obj, fields) {
  const missing = fields.filter(
    (f) => obj[f] === undefined || obj[f] === null || obj[f] === ""
  );
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
}

async function hasOverlap({
  vehicle_id,
  start_time,
  end_time,
  excludeId = null,
}) {
  let q = knex("dispatch")
    .where({ vehicle_id })
    .whereIn("status", ["APPROVED"])
    .andWhere("start_time", "<", end_time)
    .andWhere("end_time", ">", start_time);

  if (excludeId) q = q.andWhereNot("id", excludeId);

  const rows = await q.select("id");
  return rows.length > 0;
}

//check api is running
app.get("/", (_req, res) => {
  res.send("App is up and running.");
});

//users list
app.get(
  "/users",
  asyncH(async (_req, res) => {
    const rows = await knex("users").select("*").orderBy("id", "asc");
    res.json({ data: rows });
  })
);

//driver's list
app.get(
  "/drivers",
  asyncH(async (_req, res) => {
    const rows = await knex("drivers")
      .select("*")
      .orderBy("last_name", "asc")
      .orderBy("first_name", "asc");
    res.json({ data: rows });
  })
);

app.get(
  "/drivers/:id/quals",
  asyncH(async (req, res) => {
    const rows = await knex("qualifications_drivers")
      .where({ driver_id: req.params.id })
      .select("*");
    res.json({ data: rows });
  })
);

//vix
app.get(
  "/vehicles",
  asyncH(async (req, res) => {
    const { serviceable, availableFrom, availableTo } = req.query;

    if (availableFrom && availableTo) {
      const rows = await knex("vehicles as v")
        .leftJoin("dispatch as d", function () {
          this.on("d.vehicle_id", "v.id")
            .andOn(knex.raw(`d.status = 'APPROVED'`))
            .andOn("d.start_time", "<", availableTo)
            .andOn("d.end_time", ">", availableFrom);
        })
        .modify((qb) => {
          if (serviceable === "true") qb.where("v.is_serviceable", true);
          if (serviceable === "false") qb.where("v.is_serviceable", false);
        })
        .whereNull("d.id")
        .select("v.*")
        .orderBy("v.bumper_number", "asc");

      return res.json({ data: rows });
    }

    const rows = await knex("vehicles")
      .modify((qb) => {
        if (serviceable === "true") qb.where("is_serviceable", true);
        if (serviceable === "false") qb.where("is_serviceable", false);
      })
      .select("*")
      .orderBy("bumper_number", "asc");

    res.json({ data: rows });
  })
);

//dispatch routes
app.get(
  "/dispatch",
  asyncH(async (req, res) => {
    const { status, requested_by_user_id, vehicle_id, driver_id } = req.query;

    const rows = await knex("dispatch as d")
      .leftJoin("vehicles as v", "v.id", "d.vehicle_id")
      .leftJoin("drivers as dr", "dr.id", "d.driver_id")
      .leftJoin("users as u", "u.id", "d.requested_by_user_id")
      .modify((qb) => {
        if (status) qb.where("d.status", status);
        if (requested_by_user_id)
          qb.where("d.requested_by_user_id", requested_by_user_id);
        if (vehicle_id) qb.where("d.vehicle_id", vehicle_id);
        if (driver_id) qb.where("d.driver_id", driver_id);
      })
      .select(
        "d.*",
        "v.bumper_number",
        "v.type as vehicle_type",
        knex.raw("dr.rank || ' ' || dr.last_name as driver_name"),
        "u.name as requested_by_name"
      )
      .orderBy("d.start_time", "desc");

    res.json({ data: rows });
  })
);

//post dispatch
app.post(
  "/dispatch",
  asyncH(async (req, res) => {
    const body = req.body || {};
    requireFields(body, [
      "vehicle_id",
      "driver_id",
      "requested_by_user_id",
      "start_time",
      "end_time",
      "destination",
      "purpose",
    ]);

    const { vehicle_id, start_time, end_time } = body;

    if (new Date(start_time) >= new Date(end_time)) {
      const err = new Error("start_time must be before end_time");
      err.status = 400;
      throw err;
    }

    //404 error if vic is not avail or serviceable
    const vehicle = await knex("vehicles").where({ id: vehicle_id }).first();
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    if (!vehicle.is_serviceable) {
      const err = new Error("Vehicle is not serviceable");
      err.status = 400;
      throw err;
    }

    const created = await knex("dispatch").insert(
      {
        vehicle_id: body.vehicle_id,
        driver_id: body.driver_id,
        requested_by_user_id: body.requested_by_user_id,
        start_time: body.start_time,
        end_time: body.end_time,
        destination: body.destination,
        purpose: body.purpose,
        status: "PENDING",
        odometer_out: body.odometer_out ?? null,
        fuel_out_percent: body.fuel_out_percent ?? null,
      },
      ["*"]
    );

    res.status(201).json({ data: created[0] });
  })
);

app.put(
  "/dispatch/:id/approve",
  asyncH(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await knex("dispatch").where({ id }).first();
    if (!existing) {
      const err = new Error("Dispatch not found");
      err.status = 404;
      throw err;
    }

    if (existing.status !== "PENDING") {
      const err = new Error("Only PENDING requests can be approved");
      err.status = 400;
      throw err;
    }

    const overlap = await hasOverlap({
      vehicle_id: existing.vehicle_id,
      start_time: existing.start_time,
      end_time: existing.end_time,
      excludeId: id,
    });
    if (overlap) {
      const err = new Error("Vehicle already booked in that window");
      err.status = 409;
      throw err;
    }

    const patch = {
      status: "APPROVED",
      odometer_out: req.body?.odometer_out ?? existing.odometer_out,
      fuel_out_percent: req.body?.fuel_out_percent ?? existing.fuel_out_percent,
      updated_at: knex.fn.now(),
    };

    const updated = await knex("dispatch").where({ id }).update(patch, ["*"]);
    res.json({ data: updated[0] });
  })
);

app.put(
  "/dispatch/:id/deny",
  asyncH(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await knex("dispatch").where({ id }).first();
    if (!existing) {
      const err = new Error("Dispatch not found");
      err.status = 404;
      throw err;
    }
    if (existing.status !== "PENDING") {
      const err = new Error("Only PENDING requests can be denied");
      err.status = 400;
      throw err;
    }
    const updated = await knex("dispatch")
      .where({ id })
      .update({ status: "DENIED", updated_at: knex.fn.now() }, ["*"]);
    res.json({ data: updated[0] });
  })
);

app.put(
  "/dispatch/:id/complete",
  asyncH(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await knex("dispatch").where({ id }).first();
    if (!existing) {
      const err = new Error("Dispatch not found");
      err.status = 404;
      throw err;
    }
    if (existing.status !== "APPROVED") {
      const err = new Error("Only APPROVED dispatches can be completed");
      err.status = 400;
      throw err;
    }

    const updated = await knex("dispatch").where({ id }).update(patch, ["*"]);
    res.json({ data: updated[0] });
  })
);

//delete dispatch
app.delete(
  "/dispatch/:id",
  asyncH(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await knex("dispatch").where({ id }).first();
    if (!existing) {
      const err = new Error("Dispatch not found");
      err.status = 404;
      throw err;
    }
    if (existing.status !== "PENDING") {
      const err = new Error("Only PENDING requests can be cancelled");
      err.status = 400;
      throw err;
    }
    await knex("dispatch")
      .where({ id })
      .update({ status: "CANCELLED", updated_at: knex.fn.now() });
    res.status(204).end();
  })
);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

//boot server
app.listen(port, () => {
  console.log(`Your Knex + Express app running on http://localhost:${port}`);
});

module.exports = app;
