import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
});

export default ChatMessageSchema;
