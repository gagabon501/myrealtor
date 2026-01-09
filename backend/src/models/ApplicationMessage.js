import mongoose from "mongoose";

const applicationMessageSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderRole: { type: String, enum: ["user", "staff", "admin"], required: true },
    recipientRole: { type: String, enum: ["user", "staff", "admin"], default: "staff" },
    body: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationMessageSchema.index({ application: 1, createdAt: 1 });

export default mongoose.model("ApplicationMessage", applicationMessageSchema);


