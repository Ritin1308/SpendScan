const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeReceipt, getExpenses } = require("../controllers/receiptController");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("receipt"), analyzeReceipt);
router.get("/", getExpenses);

module.exports = router;
