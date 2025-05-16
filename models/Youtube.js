import mongoose from "mongoose";

const YTSchema = new mongoose.Schema({
  url: { type: String, required: true },
  text: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Youtube || mongoose.model("Youtube", YTSchema);
