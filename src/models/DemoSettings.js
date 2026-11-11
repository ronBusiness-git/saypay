import mongoose from "mongoose";

const DemoSettingsSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      unique: true,
      default: "demo-workspace",
      index: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    transactionLimitMinor: {
      type: Number,
      default: 50000, // $500.00 in minor units
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DemoSettings || mongoose.model("DemoSettings", DemoSettingsSchema);
