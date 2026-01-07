import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: [
        "ATS",
        "PROPERTY",
        "APPRAISAL",
        "TITLE_TRANSFER",
        "INQUIRY",
        "OTHER",
      ],
      required: true,
    },
    ownerType: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    category: String,
    label: String,
    description: { type: String, required: true },
    filePath: { type: String, required: true }, // e.g., /uploads/documents/<filename>
    mimeType: String,
    originalName: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

documentSchema.index({ module: 1, ownerId: 1 });
documentSchema.index({ ownerType: 1, ownerId: 1 });

export default mongoose.model("Document", documentSchema);
