import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  title: { type: String, default: "New Chat" },
  messages: [
    {
      type: {
        type: String,
        enum: ["user", "ai", "error"],
        required: true,
      },
      data: { type: mongoose.Schema.Types.Mixed, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
