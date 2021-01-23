require('dotenv').config();
const express = require('express');
const db = require("./db");
const morgan = require('morgan');
const app = express();
const cors = require("cors");

// Middleware (where we place this middleware matters)
/* app.use(morgan("dev"))

app.use((req, res, next) => {
    next(); // passes on request/ respose to required handler
}); */
app.use(cors());
app.use(express.json());

// --- PROPERTIES ROUTES ---

// Get all Properties
app.get("/api/v1/properties", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM properties")
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                properties: results.rows,
            }
        });
    } catch (err) {
        console.log(err)
    }
});

// Get a single Property
app.get("/api/v1/properties/:property_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM properties WHERE property_id = $1", [req.params.property_id]) // $1 is passed to the first item in the array, $2 to the 2nd, $3 to the 3rd no matter the arrangement
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows[0],
            }
        })
    } catch (err) {
        console.log(err)
    }
});

// Create a Property (because of express.json middleware, all fields that come within the body will be attached as a json object onto req.body)
app.post("/api/v1/properties", async (req,res) => {
    try {
        const results = await db.query("INSERT INTO properties (property_name) VALUES ($1) returning *", [req.body.property_name])
        res.status(201).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows[0],
            }
        })
    } catch (err) {
        console.log(err)
    }
});

// Update a Property
app.put("/api/v1/properties/:property_id", async (req,res) => {
    try {
        const results = await db.query("UPDATE properties SET property_name = $1 WHERE property_id = $2 returning *", [req.body.property_name, req.params.property_id])
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err)
    }
});

// Delete a Property
app.delete("/api/v1/properties/:property_id", async (req,res) => {
    try {
        const results = db.query("DELETE FROM properties WHERE property_id = $1", [req.params.property_id])
        res.status(204).json({
            status: "No Content"
        });
    } catch (err) {
        console.log(err)
    }
});


// --- EXPENSES ROUTES ---

// Get all Expenses
app.get("/api/v1/expenses", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM expenses")
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                properties: results.rows,
            }
        });
    } catch (err) {
        console.log(err)
    }
});

// Get a single Expense
app.get("/api/v1/expenses/:expenses_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM expenses JOIN properties ON expenses.property_id = properties.property_id WHERE expenses_id = $1", [req.params.expenses_id]) 
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows[0],
            }
        })
    } catch (err) {
        console.log(err)
    }
});

// Create an Expense (because of express.json middleware, all fields that come within the body will be attached as a json object onto req.body)
app.post("/api/v1/expenses/:property_name", async (req,res) => {
    try {
        const results = await db.query("INSERT INTO expenses (paid_to, payment_reason, created_on, download_url, amount, fully_paid, property_id) VALUES ($1, $2, $3, $4, $5, $6, (SELECT property_id FROM properties WHERE property_name=$7)) returning *", [req.body.paid_to, req.body.payment_reason, req.body.created_on, req.body.download_url, req.body.amount, req.body.fully_paid, req.params.property_name])
        res.status(201).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows[0]
            }
        })
    } catch (err) {
        console.log(err)
    }
});

// Update an Expense
app.put("/api/v1/expenses/:property_name/:expenses_id", async (req,res) => {
    console.log(req)
    try {
        const results = await db.query("UPDATE expenses SET paid_to = $1, payment_reason = $2, created_on = $3, download_url = $4, amount = $5, fully_paid = $6, property_id = (SELECT property_id FROM properties WHERE property_name=$7) WHERE expenses_id = $8 returning *", [req.body.paid_to, req.body.payment_reason, req.body.created_on, req.body.download_url, req.body.amount, req.body.fully_paid, req.params.property_name, req.params.expenses_id])
        res.status(200).json({
            status: "success",
            results: results.rows.length,
            data: {
                property: results.rows,
            }
        });
    } catch (err) {
        console.log(err)
    }
});

// Delete an Expense
app.delete("/api/v1/expenses/:expenses_id", async (req,res) => {
    try {
        const results = db.query("DELETE FROM expenses WHERE expenses_id = $1", [req.params.expenses_id])
        res.status(204).json({
            status: "No Content"
        });
    } catch (err) {
        console.log(err)
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});