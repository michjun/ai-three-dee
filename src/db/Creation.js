import mongoose from "mongoose";

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
  aiModel: {
    type: String,
    required: true,
    default: "gpt4",
    trim: true,
    index: true,
  },
  chatThread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chatThread",
  },
});

const Creation =
  mongoose.models.creation || mongoose.model("creation", CreationSchema);

export default Creation;
