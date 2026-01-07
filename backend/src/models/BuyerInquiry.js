import mongoose from "mongoose";

const buyerInquirySchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: { type: String, required: true },
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

