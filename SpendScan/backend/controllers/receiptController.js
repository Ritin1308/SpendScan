const fs = require("fs");
const axios = require("axios");
const Expense = require("../models/Expense");

const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const key = process.env.AZURE_FORM_RECOGNIZER_KEY;

exports.analyzeReceipt = async (req, res) => {
  const filePath = req.file.path;

  try {
    const imageData = fs.readFileSync(filePath);

    // Step 1: Send image for analysis
    const postResponse = await axios.post(
      `${endpoint}formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2023-07-31`,
      imageData,
      {
        headers: {
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": key,
        },
      }
    );

    const operationLocation = postResponse.headers["operation-location"];
    if (!operationLocation) {
      throw new Error("No operation-location returned from Azure");
    }

    // Step 2: Poll the operation URL until analysis is complete
    let result;
    let retries = 10;

    while (retries > 0) {
      const getResponse = await axios.get(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
        },
      });

      if (getResponse.data.status === "succeeded") {
        result = getResponse.data;
        break;
      } else if (getResponse.data.status === "failed") {
        throw new Error("Azure analysis failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s
      retries--;
    }

    if (!result || !result.analyzeResult) {
      throw new Error("Analysis result not available");
    }

    const doc = result.analyzeResult.documents[0]?.fields || {};
    const data = {
      merchant: doc?.MerchantName?.valueString || "Unknown",
      date: doc?.TransactionDate?.valueDate || new Date(),
      total: doc?.Total?.valueNumber || 0,
    };

    const saved = await Expense.create(data);
    res.json(saved);
  } catch (err) {
    console.error("❌", err.response?.data || err.message);
    res.status(500).json({ error: "Receipt analysis failed" });
  } finally {
    fs.unlinkSync(filePath);
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};
