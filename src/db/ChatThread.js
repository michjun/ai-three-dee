import mongoose from "mongoose";
import ChatMessageSchema from "src/db/ChatMessage";

const ChatThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  messages: [ChatMessageSchema],
  exampleCount: {
    type: Number,
    required: true,
  },
  refineCount: {
    type: Number,
    required: true,
  },
});

const ChatThread =
  mongoose.models.chatThread || mongoose.model("chatThread", ChatThreadSchema);

export default ChatThread;
