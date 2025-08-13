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
      
      if (kpiCount === 0 && productCount === 0 && transactionCount === 0) {
        console.log("No data found, inserting sample data...");
        await KPI.insertMany(kpis);
        await Product.insertMany(products);
        await Transaction.insertMany(transactions);
        console.log("Sample data inserted successfully!");
      } else {
        console.log("Data already exists, skipping insertion.");
      }
    } catch (error) {
      console.log("Error inserting data:", error);
    }
  })
  .catch((error) => console.log(`${error} did not connect`));