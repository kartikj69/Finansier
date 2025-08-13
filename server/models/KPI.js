import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Custom currency type that stores values in cents and converts to dollars
const currencySchema = {
  type: Number,
  get: (v) => v / 100,
  set: (v) => Math.round(v * 100),
  default: 0
};

const daySchema = new Schema(
  {
    date: String,
    revenue: currencySchema,
    expenses: currencySchema,
  },
  { toJSON: { getters: true } }
);

const monthSchema = new Schema(
  {
    month: String,
    revenue: currencySchema,
    expenses: currencySchema,
    operationalExpenses: currencySchema,
    nonOperationalExpenses: currencySchema,
  },
  { toJSON: { getters: true } }
);

const KPISchema = new Schema(
  {
    totalProfit: currencySchema,
    totalRevenue: currencySchema,
    totalExpenses: currencySchema,
    expensesByCategory: {
      type: Map,
      of: currencySchema,
    },
    monthlyData: [monthSchema],
    dailyData: [daySchema],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const KPI = mongoose.model("KPI", KPISchema);

export default KPI;