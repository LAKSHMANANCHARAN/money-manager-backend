const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

// POST /api/budgets - Create budget
router.post("/", budgetController.createBudget);

// GET /api/budgets - Get all budgets
router.get("/", budgetController.getBudgets);

// DELETE /api/budgets/:id - Delete budget
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;