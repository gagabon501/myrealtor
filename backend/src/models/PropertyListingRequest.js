import mongoose from "mongoose";

const propertyDraftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    tags: [String],
    earnestMoneyRequired: { type: Boolean, default: false },
  },
  { _id: false }
);

const propertyListingRequestSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "ATS_PENDING", "ATS_APPROVED", "ATS_REJECTED"],
      default: "ATS_PENDING",
    },
    propertyDraft: propertyDraftSchema,
    reviewerNotes: String,
    linkedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    atsApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    atsApprovedAt: Date,
    atsRejectedReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("PropertyListingRequest", propertyListingRequestSchema);

