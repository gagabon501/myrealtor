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
    regulatoryStatus: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED_TO_AGENCY", "APPROVED", "REJECTED"],
      default: "NOT_STARTED",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "OPEN" },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);

