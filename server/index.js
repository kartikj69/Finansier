import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/kpi", kpiRoutes);
app.use("/product", productRoutes);
app.use("/transaction", transactionRoutes);

/* Serve static files from React app */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, "../client/dist");
console.log("Client dist path:", clientDistPath);

// Check if the client dist directory exists
import fs from "fs";
if (fs.existsSync(clientDistPath)) {
  console.log("✅ Client dist directory found");
  const files = fs.readdirSync(clientDistPath);
  console.log("Files in client/dist:", files);
} else {
  console.log("❌ Client dist directory not found!");
}

// Serve static files from the React app
app.use(express.static(clientDistPath));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  console.log("Serving request for:", req.path);
  const indexPath = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("React app not found. Please ensure the client was built successfully.");
  }
});

// Function to convert currency strings to numbers (remove $ and convert to cents)
function convertCurrencyToNumber(currencyString) {
  // Handle null, undefined, or empty strings
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remove $ and commas, then convert to number
  const cleanString = currencyString.replace(/[$,\s]/g, '');
  
  // Check if the result is a valid number
  const number = parseFloat(cleanString);
  
  // Return 0 if the result is NaN or negative, otherwise return the number in cents
  if (isNaN(number) || number < 0) {
    console.warn(`⚠️  Invalid currency value: "${currencyString}" converted to 0`);
    return 0;
  }
  
  return Math.round(number * 100);
}

// Function to process KPI data
function processKPIData(kpiData) {
  try {
    return {
      ...kpiData,
      totalProfit: convertCurrencyToNumber(kpiData.totalProfit),
      totalRevenue: convertCurrencyToNumber(kpiData.totalRevenue),
      totalExpenses: convertCurrencyToNumber(kpiData.totalExpenses),
      monthlyData: kpiData.monthlyData.map(month => ({
        ...month,
        revenue: convertCurrencyToNumber(month.revenue),
        expenses: convertCurrencyToNumber(month.expenses),
        operationalExpenses: convertCurrencyToNumber(month.operationalExpenses),
        nonOperationalExpenses: convertCurrencyToNumber(month.nonOperationalExpenses),
      })),
      dailyData: kpiData.dailyData.map(day => ({
        ...day,
        revenue: convertCurrencyToNumber(day.revenue),
        expenses: convertCurrencyToNumber(day.expenses),
      })),
      expensesByCategory: kpiData.expensesByCategory || {}
    };
  } catch (error) {
    console.error("❌ Error processing KPI data:", error);
    console.error("KPI data:", kpiData);
    throw error;
  }
}

// Function to process Product data
function processProductData(productData) {
  try {
    return {
      ...productData,
      price: convertCurrencyToNumber(productData.price),
      expense: convertCurrencyToNumber(productData.expense),
    };
  } catch (error) {
    console.error("❌ Error processing Product data:", error);
    console.error("Product data:", productData);
    throw error;
  }
}

// Function to process Transaction data
function processTransactionData(transactionData) {
  try {
    return {
      ...transactionData,
      amount: convertCurrencyToNumber(transactionData.amount),
    };
  } catch (error) {
    console.error("❌ Error processing Transaction data:", error);
    console.error("Transaction data:", transactionData);
    throw error;
  }
}

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
console.log("Connecting to MongoDB with URL:", process.env.MONGO_URL);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME ONLY OR AS NEEDED */
    try {
      // Check if data already exists
      const kpiCount = await KPI.countDocuments();
      const productCount = await Product.countDocuments();
      const transactionCount = await Transaction.countDocuments();
      
      console.log(`📊 Current document counts:`);
      console.log(`   KPIs: ${kpiCount}`);
      console.log(`   Products: ${productCount}`);
      console.log(`   Transactions: ${transactionCount}`);
      
      if (kpiCount === 0 && productCount === 0 && transactionCount === 0) {
        console.log("🌱 No data found, inserting sample data...");
        
        // Process and insert KPIs
        console.log("📈 Processing KPIs...");
        const processedKPIs = kpis.map(processKPIData);
        await KPI.insertMany(processedKPIs);
        console.log(`✅ Inserted ${processedKPIs.length} KPIs`);
        
        // Process and insert Products
        console.log("📦 Processing Products...");
        const processedProducts = products.map(processProductData);
        await Product.insertMany(processedProducts);
        console.log(`✅ Inserted ${processedProducts.length} Products`);
        
        // Process and insert Transactions
        console.log("💳 Processing Transactions...");
        const processedTransactions = transactions.map(processTransactionData);
        await Transaction.insertMany(processedTransactions);
        console.log(`✅ Inserted ${processedTransactions.length} Transactions`);
        
        console.log("🎉 Sample data inserted successfully!");
      } else {
        console.log("⚠️  Data already exists, skipping insertion.");
      }
    } catch (error) {
      console.log("❌ Error inserting data:", error);
      console.error("Full error:", error);
    }
  })
  .catch((error) => console.log(`${error} did not connect`));