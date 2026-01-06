import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: String,
    path: String,
  },
  { _id: false }
);

const appraisalRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    address: String,
    email: { type: String, required: true },
    phone: String,
    propertyLocation: { type: String, required: true },
    size: String,
    includesBuilding: { type: Boolean, default: false },
    numberOfFloors: { type: Number, default: 0 },
    timeOfBuild: String,
    lastRepair: String,
    appointment: String,
    documents: [documentSchema],
    rate: { type: Number, required: true },
    upfront: Number,
    remaining: Number,
    status: { type: String, default: "SUBMITTED" },
  },
  { timestamps: true }
);

export default mongoose.model("AppraisalRequest", appraisalRequestSchema);

