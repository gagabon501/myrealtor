import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    appraiserName: String,
    licenseNumber: String,
    signedDate: Date,
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

const appraisalReportSchema = new mongoose.Schema(
  {
    appraisalRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppraisalRequest",
      required: true,
    },
    // Report sections
    introduction: String,
    propertyIdentification: String,
    purpose: String,
    highestAndBestUse: String,
    marketAnalysis: String,
    valuationApproach: String,
    valueConclusion: String,
    limitingConditions: String,
    // Appraisal value
    appraiserValue: Number,
    effectiveDate: Date,
    // Certification
    certification: certificationSchema,
    // Status workflow
    status: {
      type: String,
      enum: ["DRAFT", "FINAL", "RELEASED"],
      default: "DRAFT",
    },
    finalPdf: finalPdfSchema,
    releasedAt: Date,
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

appraisalReportSchema.index({ appraisalRequestId: 1 });
appraisalReportSchema.index({ status: 1 });

export default mongoose.model("AppraisalReport", appraisalReportSchema);
