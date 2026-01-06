import mongoose from "mongoose";

const interestedBuyerSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: { type: String, required: true },
    notes: String,
    earnestMoneyRequired: { type: Boolean, default: false },
    status: { type: String, default: "INTERESTED" },
  },
  { timestamps: true }
);

export default mongoose.model("InterestedBuyer", interestedBuyerSchema);

