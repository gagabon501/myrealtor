import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"],
      default: "SUBMITTED",
    },
    // legacy fields retained for compatibility
    stage: { type: String },
    regulatoryStatus: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    activity: [
      {
        at: { type: Date, default: Date.now },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        actorRole: { type: String },
        action: { type: String },
        fromStatus: { type: String },
        toStatus: { type: String },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);

