import mongoose from "mongoose";

export async function connectDb(uri: string): Promise<void> {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDb(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}
