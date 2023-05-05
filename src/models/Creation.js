import mongoose from "mongoose";
import ChatMessageSchema from "./ChatMessage";

const CreationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  messages: [ChatMessageSchema],
});

const Creation =
  mongoose.models.creation || mongoose.model("creation", CreationSchema);

export default Creation;
