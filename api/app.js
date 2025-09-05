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
        .where({vehicle_id})
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
app.get('/users', (req, res) => {
    knex('users')
        .select('*')
        .then(users => {
            res.status(200).json(users);
        })
        .catch( err => {
            if (err) console.error(err);
            res.status(400).json("Couldn't fetch users")
        })
})

//driver's list
app.get(
    "/drivers",
    asyncH(async (_req, res) => {
        const rows = await knex("drivers").select("*").orderBy("last_name", "asc");
        res.json({data: rows});
    })
);

app.get(
    "/drivers/:id/quals",
    asyncH(async (req, res) => {
        const rows = await knex("qualifications as Q")
            .join("qualifications_drivers as Y", "Q.id", "Y.qualification_id")
            .join("drivers as D", "Y.driver_id", "D.id")
            .select("Q.qualification")
            .where("D.id", req.params.id)
            .then((quals) => {
                return quals.map((qual) => {
                    return qual.qualification;
                });
            });
        res.json({data: rows});
    })
);

//vix
app.get("/vehicles", (req, res) => {
    knex("vehicles")
        .select("*")
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((e) => {
            if (e) console.error(e);
            res.status(400).send("Couldn't fetch vehicles");
        });
});

//dispatch routes
app.get("/dispatch", (req, res) => {
    knex("dispatch as I")
        .join("vehicles as V", "V.id", "I.vehicle_id")
        .join("drivers as D", "D.id", "I.driver_id")
        .select(
            "V.type",
            "V.callsign",
            "D.first_name",
            "I.sign_out",
            "I.sign_in",
            "I.status"
        )
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((e) => {
            if (e) console.error(e);
            res.status(400).send("Could not fetch dispatches");
        });
});

app.get("/dispatch/:userId", (req, res) => {
    knex("dispatch as I")
        .join("vehicles as V", "V.id", "I.vehicle_id")
        .join("drivers as D", "D.id", "I.driver_id")
        .select(
            "V.type",
            "V.callsign",
            "D.first_name",
            "I.sign_out",
            "I.sign_in",
            "I.status"
        )
        .where("I.user_id", req.params.userId)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((e) => {
            if (e) console.error(e);
            res.status(400).send("Could not fetch dispatches");
        });
})

app.get("/drivers/:id", (req, res) => {
    knex("drivers")
        .select("*")
        .where("id", req.params.id)
        .then((data) => {
            res.status(200).json(data);
        });
});

//post dispatch

app.post("/dispatch", (req, res) => {
    knex("dispatch").insert({
        vehicle_id: req.body.vehicle_id,
        user_id: req.body.user_id,
        driver_id: req.body.driver_id,
        sign_out: req.body.sign_out,
        sign_in: req.body.sign_in,
        status: "pending",
    });
    res.status(200).json({message: "Saved dispatch information"});
    console.log("dispatch saved").catch((err) => {
        if (err) console.error(err);
        res.status(400).json({error: "Failed to save dispatch"});
    });
});

//     const { vehicle_id, start_time, end_time } = body;

//     if (new Date(start_time) >= new Date(end_time)) {
//       const err = new Error("start_time must be before end_time");
//       err.status = 400;
//       throw err;
//     }

//     //404 error if vic is not avail or serviceable
//     const vehicle = await knex("vehicles").where({ id: vehicle_id }).first();
//     if (!vehicle) {
//       const err = new Error("Vehicle not found");
//       err.status = 404;
//       throw err;
//     }
//     if (!vehicle.is_serviceable) {
//       const err = new Error("Vehicle is not serviceable");
//       err.status = 400;
//       throw err;
//     }

//     const created = await knex("dispatch").insert(
//       {
//         vehicle_id: body.vehicle_id,
//         driver_id: body.driver_id,
//         requested_by_user_id: body.requested_by_user_id,
//         start_time: body.start_time,
//         end_time: body.end_time,
//         destination: body.destination,
//         purpose: body.purpose,
//         status: "PENDING",
//       },
//       ["*"]
//     );

//     res.status(201).json({ data: created[0] });
//   })
// );

// app.put(
//   "/dispatch/:id/approve",
//   asyncH(async (req, res) => {
//     const id = Number(req.params.id);
//     const existing = await knex("dispatch").where({ id }).first();
//     if (!existing) {
//       const err = new Error("Dispatch not found");
//       err.status = 404;
//       throw err;
//     }

//     if (existing.status !== "PENDING") {
//       const err = new Error("Only PENDING requests can be approved");
//       err.status = 400;
//       throw err;
//     }

//     const overlap = await hasOverlap({
//       vehicle_id: existing.vehicle_id,
//       start_time: existing.start_time,
//       end_time: existing.end_time,
//       excludeId: id,
//     });
//     if (overlap) {
//       const err = new Error("Vehicle already booked in that window");
//       err.status = 409;
//       throw err;
//     }

//     const patch = {
//       status: "APPROVED",
//     };

//     const updated = await knex("dispatch").where({ id }).update(patch, ["*"]);
//     res.json({ data: updated[0] });
//   })
// );

// app.put(
//   "/dispatch/:id/deny",
//   asyncH(async (req, res) => {
//     const id = Number(req.params.id);
//     const existing = await knex("dispatch").where({ id }).first();
//     if (!existing) {
//       const err = new Error("Dispatch not found");
//       err.status = 404;
//       throw err;
//     }
//     if (existing.status !== "PENDING") {
//       const err = new Error("Only PENDING requests can be denied");
//       err.status = 400;
//       throw err;
//     }
//     const updated = await knex("dispatch")
//       .where({ id })
//       .update({ status: "DENIED", updated_at: knex.fn.now() }, ["*"]);
//     res.json({ data: updated[0] });
//   })
// );

// app.put(
//   "/dispatch/:id/complete",
//   asyncH(async (req, res) => {
//     const id = Number(req.params.id);
//     const existing = await knex("dispatch").where({ id }).first();
//     if (!existing) {
//       const err = new Error("Dispatch not found");
//       err.status = 404;
//       throw err;
//     }
//     if (existing.status !== "APPROVED") {
//       const err = new Error("Only APPROVED dispatches can be completed");
//       err.status = 400;
//       throw err;
//     }

//     const updated = await knex("dispatch").where({ id }).update(patch, ["*"]);
//     res.json({ data: updated[0] });
//   })
// );

//delete dispatch
// app.delete(
//   "/dispatch/:id",
//   asyncH(async (req, res) => {
//     const id = Number(req.params.id);
//     const existing = await knex("dispatch").where({ id }).first();
//     if (!existing) {
//       const err = new Error("Dispatch not found");
//       err.status = 404;
//       throw err;
//     }
//     if (existing.status !== "PENDING") {
//       const err = new Error("Only PENDING requests can be cancelled");
//       err.status = 400;
//       throw err;
//     }
//     await knex("dispatch")
//       .where({ id })
//       .update({ status: "CANCELLED", updated_at: knex.fn.now() });
//     res.status(204).end();
//   })
// );

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({error: err.message || "Server error"});
});

//boot server
app.listen(port, () => {
    console.log(`Your Knex + Express app running on http://localhost:${port}`);
});

module.exports = app;
