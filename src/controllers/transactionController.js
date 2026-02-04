const Transaction = require("../models/Transaction");

// Add Income or Expense
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, division, description, account } = req.body;

    if (!type || !amount || !category || !division || !account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transaction = new Transaction({
      type,
      amount,
      category,
      division,
      description,
      account,
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all transactions with filters
exports.getTransactions = async (req, res) => {
  try {
    const { category, division, startDate, endDate, type } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (division) filter.division = division;
    if (type) filter.type = type;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Transaction.find(filter).sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Edit transaction (within 12 hours only)
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const now = new Date();
    const createdTime = new Date(transaction.createdAt);
    const diffHours = (now - createdTime) / (1000 * 60 * 60);

    if (diffHours > 12) {
      return res
        .status(403)
        .json({ message: "Editing time expired (12 hours limit)" });
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Dashboard summary (weekly / monthly / yearly)
exports.getSummary = async (req, res) => {
  try {
    const { range } = req.query;

    let startDate = new Date();

    if (range === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (range === "yearly") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      return res.status(400).json({ message: "Invalid range" });
    }

    const summary = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    res.json({ income, expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Category-wise summary for expenses only
exports.getCategorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          type: "expense" // Only include expenses in pie chart
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

