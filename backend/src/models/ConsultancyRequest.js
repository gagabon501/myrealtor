import mongoose from "mongoose";

const consultancyRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    topic: String,
    appointment: String,
    status: { type: String, default: "SUBMITTED" },
  },
  { timestamps: true }
);

export default mongoose.model("ConsultancyRequest", consultancyRequestSchema);

