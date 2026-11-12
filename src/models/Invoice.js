import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    merchantKey: {
      type: String,
      required: true,
      index: true,
    },
    merchantName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    description: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ["UNPAID", "PAID", "CANCELLED"],
      default: "UNPAID",
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    checkId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
