import mongoose from "mongoose";

const sellerDetailsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
  },
  { _id: false }
);

const signatureSchema = new mongoose.Schema(
  {
    signedName: String,
    signedAt: Date,
    consentChecked: { type: Boolean, default: false },
    ipAddress: String,
    userAgent: String,
  },
  { _id: false }
);

const atsDetailsSchema = new mongoose.Schema(
  {
    titleNosTaxDec: String,
    lotArea: String,
    ownersNetPrice: Number,
    periodStart: Date,
    periodEnd: Date,
    remarks: String,
  },
  { _id: false }
);

const finalPdfSchema = new mongoose.Schema(
  {
    storageKey: String,
    url: String,
    version: { type: Number, default: 1 },
    finalizedAt: Date,
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const propertyDraftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    tags: [String],
    earnestMoneyRequired: { type: Boolean, default: false },
    earnestMoneyAmount: { type: Number },
  },
  { _id: false }
);

const propertyListingRequestSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "ATS_PENDING", "ATS_APPROVED", "ATS_REJECTED", "ATS_FINALIZED"],
      default: "ATS_PENDING",
    },
    propertyDraft: propertyDraftSchema,
    // Seller details for ATS
    seller: sellerDetailsSchema,
    // ATS specific details
    atsDetails: atsDetailsSchema,
    // Signature for ATS consent
    signature: signatureSchema,
    // Finalized PDF
    finalPdf: finalPdfSchema,
    reviewerNotes: String,
    linkedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    atsApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    atsApprovedAt: Date,
    atsRejectedReason: String,
    publishedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    publishedAt: Date,
    idempotencyKey: { type: String },
    clientRequestId: { type: String },
  },
  { timestamps: true }
);

propertyListingRequestSchema.index({ createdBy: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
propertyListingRequestSchema.index({ createdBy: 1, clientRequestId: 1 }, { unique: true, sparse: true });

export default mongoose.model("PropertyListingRequest", propertyListingRequestSchema);

