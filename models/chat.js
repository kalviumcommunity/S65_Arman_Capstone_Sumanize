import mongoose from "mongoose";

const CitationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    sourceText: {
      type: String,
      required: true,
    },
    startIndex: {
      type: Number,
      required: true,
    },
    endIndex: {
      type: Number,
      required: true,
    },
    isMatched: {
      type: Boolean,
      default: false,
    },
    matchedText: {
      type: String,
      required: false,
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  { _id: false },
);

const MessageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
    },
    pastedContent: {
      type: String,
      required: false,
    },
    citations: {
      type: [CitationSchema],
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Chat",
    },
    messages: [MessageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

ChatSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
