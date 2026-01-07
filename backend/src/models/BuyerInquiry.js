import mongoose from "mongoose";

const buyerInquirySchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    notes: String,
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CLOSED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BuyerInquiry", buyerInquirySchema);

