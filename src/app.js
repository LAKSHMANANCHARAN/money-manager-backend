const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transactionRoutes");
const accountRoutes = require("./routes/accountRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// 🔥 THIS LINE WAS MISSING
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);


app.get("/", (req, res) => {
  res.send("Money Manager API running");
});

module.exports = app;
