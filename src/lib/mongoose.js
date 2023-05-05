import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
let isConnected;

export async function connectToDb() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
