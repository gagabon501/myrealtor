import mongoose from "mongoose";

const propertyDraftSchema = new mongoose.Schema(
  {
    title: String,
    location: String,
    price: Number,
    description: String,
    tags: [String],
    earnestMoneyRequired: Boolean,
    images: [String],
  },
  { _id: false }
);

const atsSchema = new mongoose.Schema(
  {
    generatedAt: Date,
    signedAt: Date,
    signerName: String,
    signerEmail: String,
    signerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    signerIp: String,
    accepted: Boolean,
  },
  { _id: false }
);

const propertyListingRequestSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "ATS_PENDING",
        "ATS_SIGNED",
        "PUBLISHED",
      ],
      default: "SUBMITTED",
    },
    propertyDraft: propertyDraftSchema,
    reviewerNotes: String,
    linkedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ats: atsSchema,
  },
  { timestamps: true }
);

export default mongoose.model("PropertyListingRequest", propertyListingRequestSchema);

