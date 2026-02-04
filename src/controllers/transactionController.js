const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

// Add Income or Expense
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, division, description, account } = req.body;

    if (!type || !amount || !category || !division || !account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the account
    const accountDoc = await Account.findOne({ name: account });
    if (!accountDoc) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactionAmount = parseFloat(amount);
    
    // Check balance for expenses
    if (type === 'expense' && accountDoc.balance < transactionAmount) {
      return res.status(400).json({ message: "Insufficient balance in account" });
    }

    // Update account balance
    if (type === 'income') {
      accountDoc.balance = parseFloat(accountDoc.balance) + transactionAmount;
    } else if (type === 'expense') {
      accountDoc.balance = parseFloat(accountDoc.balance) - transactionAmount;
    }
    
    await accountDoc.save();

    // Create transaction
    const transaction = new Transaction({
      type,
      amount: transactionAmount,
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

    // Get old values
    const oldAmount = parseFloat(transaction.amount);
    const oldType = transaction.type;
    const oldAccount = transaction.account;
    const newAmount = parseFloat(req.body.amount);
    const newType = req.body.type;
    const newAccount = req.body.account;

    // Update account balances
    const oldAccountDoc = await Account.findOne({ name: oldAccount });
    if (oldAccountDoc) {
      // Reverse old transaction effect
      if (oldType === 'income') {
        oldAccountDoc.balance = parseFloat(oldAccountDoc.balance) - oldAmount;
      } else if (oldType === 'expense') {
        oldAccountDoc.balance = parseFloat(oldAccountDoc.balance) + oldAmount;
      }
      await oldAccountDoc.save();
    }

    // Apply new transaction effect
    const newAccountDoc = await Account.findOne({ name: newAccount });
    if (newAccountDoc) {
      if (newType === 'income') {
        newAccountDoc.balance = parseFloat(newAccountDoc.balance) + newAmount;
      } else if (newType === 'expense') {
        newAccountDoc.balance = parseFloat(newAccountDoc.balance) - newAmount;
      }
      await newAccountDoc.save();
    }

    // Update transaction
    Object.assign(transaction, req.body);
    transaction.amount = newAmount;
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete transaction (within 12 hours only)
exports.deleteTransaction = async (req, res) => {
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
        .json({ message: "Deletion time expired (12 hours limit)" });
    }

    // Update account balance by reversing the transaction
    const accountDoc = await Account.findOne({ name: transaction.account });
    if (accountDoc) {
      const transactionAmount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        accountDoc.balance = parseFloat(accountDoc.balance) - transactionAmount;
      } else if (transaction.type === 'expense') {
        accountDoc.balance = parseFloat(accountDoc.balance) + transactionAmount;
      }
      await accountDoc.save();
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted successfully" });
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

// Category-wise summary
exports.getCategorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
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