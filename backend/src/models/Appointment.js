import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    serviceRequestId: { type: mongoose.Schema.Types.ObjectId },
    serviceType: {
      type: String,
      enum: ["APPRAISAL", "TITLING", "CONSULTANCY", "BROKERAGE_VIEWING"],
      required: true,
    },
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    requestedStartAt: { type: Date, required: true },
    requestedEndAt: { type: Date },
    confirmedStartAt: Date,
    confirmedEndAt: Date,
    status: {
      type: String,
      enum: ["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"],
      default: "REQUESTED",
    },
    notes: String,
    internalNotes: String,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: Date,
    cancellationReason: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

appointmentSchema.index({ serviceType: 1, status: 1 });
appointmentSchema.index({ requestedStartAt: 1 });
appointmentSchema.index({ email: 1 });
appointmentSchema.index({ userId: 1 });

export default mongoose.model("Appointment", appointmentSchema);
