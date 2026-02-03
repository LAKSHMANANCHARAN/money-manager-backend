const Account = require("../models/Account");

// ➕ Create account
exports.createAccount = async (req, res) => {
  try {
    const { name, balance } = req.body;

    const account = new Account({
      name,
      balance: balance || 0,
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔁 Transfer amount between accounts
exports.transferAmount = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    const fromAccount = await Account.findById(fromAccountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    res.json({ message: "Transfer successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
