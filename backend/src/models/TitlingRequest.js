import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: String,
    path: String,
  },
  { _id: false }
);

const titlingRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    address: String,
    email: { type: String, required: true },
    phone: String,
    propertyLocation: { type: String, required: true },
    documents: [documentSchema],
    appointment: String,
    status: { type: String, default: "SUBMITTED" },
  },
  { timestamps: true }
);

export default mongoose.model("TitlingRequest", titlingRequestSchema);

