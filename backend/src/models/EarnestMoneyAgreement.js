import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
);

const buyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: String,
    email: { type: String, required: true },
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

const earnestMoneyAgreementSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "BuyerInquiry" },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    executionDate: { type: Date, required: true },
    executionLocation: { type: String, required: true },
    seller: { type: sellerSchema, required: true },
    buyer: { type: buyerSchema, required: true },
    titleNo: { type: String, required: true },
    areaSqm: { type: Number, required: true },
    earnestMoneyAmount: { type: Number, required: true },
    totalPurchasePrice: { type: Number, required: true },
    deedExecutionDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "FINAL", "VOID"],
      default: "DRAFT",
    },
    finalPdf: finalPdfSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
  },
  { timestamps: true }
);

earnestMoneyAgreementSchema.index({ propertyId: 1 });
earnestMoneyAgreementSchema.index({ "buyer.email": 1 });
earnestMoneyAgreementSchema.index({ status: 1 });

export default mongoose.model("EarnestMoneyAgreement", earnestMoneyAgreementSchema);
