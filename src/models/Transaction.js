const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      enum: ["office", "personal"],
      required: true,
    },
    description: {
      type: String,
    },
    account: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // gives createdAt & updatedAt
);

module.exports = mongoose.model("Transaction", transactionSchema);
