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
      enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
    },
    propertyDraft: propertyDraftSchema,
    reviewerNotes: String,
    linkedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  },
  { timestamps: true }
);

export default mongoose.model("PropertyListingRequest", propertyListingRequestSchema);

