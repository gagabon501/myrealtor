import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "AVAILABLE", "RESERVED", "UNDER_NEGOTIATION", "SOLD", "ARCHIVED"],
      default: "AVAILABLE",
    },
    description: String,
    tags: [String],
    images: [String],
    earnestMoneyRequired: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);

