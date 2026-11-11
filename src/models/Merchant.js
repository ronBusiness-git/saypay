import mongoose from "mongoose";

const MerchantSchema = new mongoose.Schema(
  {
    merchantKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedAliases: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    allowedCurrencies: {
      type: [String],
      default: ["USD"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Merchant || mongoose.model("Merchant", MerchantSchema);
