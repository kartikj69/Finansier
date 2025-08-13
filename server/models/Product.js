import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Custom currency type that stores values in cents and converts to dollars
const currencySchema = {
  type: Number,
  get: (v) => v / 100,
  set: (v) => Math.round(v * 100),
  default: 0
};

const ProductSchema = new Schema(
  {
    price: currencySchema,
    expense: currencySchema,
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;