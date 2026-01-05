import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    stage: {
      type: String,
      enum: [
        "INITIATED",
        "DOCUMENTS_SUBMITTED",
        "UNDER_REVIEW",
        "PAYMENT_PENDING",
        "APPROVED",
        "REJECTED",
        "TRANSFERRED",
      ],
      default: "INITIATED",
    },
    status: { type: String, default: "OPEN" },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);

