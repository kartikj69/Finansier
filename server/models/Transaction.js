import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Custom currency type that stores values in cents and converts to dollars
const currencySchema = {
  type: Number,
  get: (v) => v / 100,
  set: (v) => Math.round(v * 100),
  default: 0
};

const TransactionSchema = new Schema(
  {
    buyer: {
      type: String,
      required: true,
    },
    amount: currencySchema,
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;