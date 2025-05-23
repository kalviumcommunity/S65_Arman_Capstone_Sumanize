import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  isPremium: { type: Boolean, default: false },
  subscriptionId: { type: String },
  customerId: { type: String },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
