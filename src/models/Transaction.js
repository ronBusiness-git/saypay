import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    checkId: {
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
    amountMinor: {
      type: Number,
      required: true, // Integer cents, never float
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
    },
    reference: {
      type: String,
      default: null,
      trim: true,
    },
    paypalOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    captureId: {
      type: String,
      default: null,
      sparse: true,
    },
    createRequestId: {
      type: String,
      default: null,
    },
    captureRequestId: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: [
        "CHECKED_CLEAR",
        "ORDER_CREATED",
        "BUYER_APPROVED",
        "CAPTURE_PENDING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
        "UNKNOWN",
      ],
      default: "CHECKED_CLEAR",
      index: true,
    },
    paypalStatus: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for duplicate reference checking on completed payments
TransactionSchema.index({ merchantKey: 1, reference: 1 });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
