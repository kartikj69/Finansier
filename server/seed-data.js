import mongoose from "mongoose";
import dotenv from "dotenv";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

// Load environment variables
dotenv.config();

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
    // Process expensesByCategory if it exists
    let processedExpensesByCategory = {};
    if (kpiData.expensesByCategory && typeof kpiData.expensesByCategory === 'object') {
      for (const [key, value] of Object.entries(kpiData.expensesByCategory)) {
        processedExpensesByCategory[key] = convertCurrencyToNumber(value);
      }
    }

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
      expensesByCategory: processedExpensesByCategory
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

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log("MongoDB URL:", process.env.MONGO_URL);
    
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB successfully!");
    
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
      console.log("💡 To re-seed the database, first clear existing data:");
      console.log("   await mongoose.connection.db.dropDatabase();");
    }
    
    // Show final counts
    const finalKpiCount = await KPI.countDocuments();
    const finalProductCount = await Product.countDocuments();
    const finalTransactionCount = await Transaction.countDocuments();
    
    console.log(`📊 Final document counts:`);
    console.log(`   KPIs: ${finalKpiCount}`);
    console.log(`   Products: ${finalProductCount}`);
    console.log(`   Transactions: ${finalTransactionCount}`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
}

// Run the seeding function
seedDatabase();
