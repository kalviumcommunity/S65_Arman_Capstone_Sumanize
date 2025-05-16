import mongoose from "mongoose";

const TextSchema = new mongoose.Schema({
  text: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Text || mongoose.model("Text", TextSchema);
