const Budget = require("../models/Budget");

// Create budget
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, period } = req.body;

    if (!category || !amount || !period) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const budget = new Budget({
      category,
      amount: parseFloat(amount),
      period,
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all budgets
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find().sort({ createdAt: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};