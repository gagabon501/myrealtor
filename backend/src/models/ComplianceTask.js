import mongoose from "mongoose";

const complianceTaskSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    agency: {
      type: String,
      enum: ["DHSUD", "LRA", "NHA", "HLURB", "OTHERS"],
      default: "DHSUD",
    },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "REJECTED"],
      default: "PENDING",
    },
    dueDate: Date,
    completedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceTask", complianceTaskSchema);

