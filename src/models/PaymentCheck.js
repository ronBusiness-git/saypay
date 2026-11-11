import mongoose from "mongoose";

const PaymentCheckSchema = new mongoose.Schema(
  {
    checkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workspaceId: {
      type: String,
      default: "demo-workspace",
      index: true,
    },
    intent: {
      recipientName: { type: String, default: null },
      merchantKey: { type: String, default: null },
      amount: { type: String, default: null },
      currency: { type: String, default: "USD" },
      reference: { type: String, default: null },
      purpose: { type: String, default: null },
      needsClarification: { type: Boolean, default: false },
      clarificationReason: { type: String, default: null },
    },
    request: {
      recipientName: { type: String, default: null },
      amount: { type: String, default: null },
      currency: { type: String, default: "USD" },
      reference: { type: String, default: null },
      purpose: { type: String, default: null },
      warningIndicators: { type: [String], default: [] },
    },
    comparison: {
      recipient: { status: String, reasonCode: String },
      amount: { status: String, reasonCode: String },
      currency: { status: String, reasonCode: String },
      reference: { status: String, reasonCode: String },
      duplicate: { status: String, reasonCode: String },
      merchant: { status: String, reasonCode: String },
    },
    status: {
      type: String,
      enum: ["CLEAR", "REVIEW", "BLOCKED"],
      default: "REVIEW",
      index: true,
    },
    canCreateOrder: {
      type: Boolean,
      default: false,
    },
    reasonCodes: {
      type: [String],
      default: [],
    },
    promptVersion: {
      type: String,
      default: "v1.0",
    },
    modelName: {
      type: String,
      default: "gemini-2.0-flash",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PaymentCheck || mongoose.model("PaymentCheck", PaymentCheckSchema);
