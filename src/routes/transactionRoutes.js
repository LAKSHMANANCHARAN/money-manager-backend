const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCategorySummary,
  getSummary,
} = require("../controllers/transactionController");


router.post("/", addTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary", getSummary);
router.get("/categories/summary", getCategorySummary);

module.exports = router;
