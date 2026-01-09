import mongoose from "mongoose";

const interestedBuyerSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: { type: String, required: true },
    emailLower: { type: String, required: true },
    notes: String,
    earnestMoneyRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CLOSED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

interestedBuyerSchema.index({ propertyId: 1, emailLower: 1 }, { unique: true });

interestedBuyerSchema.pre("validate", function setLowerEmail(next) {
  if (this.email) {
    this.emailLower = String(this.email).toLowerCase();
  }
  next();
});

export default mongoose.model("InterestedBuyer", interestedBuyerSchema);

