const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transactionRoutes");
const accountRoutes = require("./routes/accountRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// CORS configuration - allow all origins for deployment
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Money Manager API running");
});

module.exports = app;