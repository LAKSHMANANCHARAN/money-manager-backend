const express = require("express");
const router = express.Router();

const {
  createAccount,
  getAccounts,
  transferAmount,
} = require("../controllers/accountController");

router.post("/", createAccount);
router.get("/", getAccounts);
router.post("/transfer", transferAmount);

module.exports = router;
