import mongoose from "mongoose";

let connectPromise: Promise<void> | undefined;
let connectionRefCount = 0;

function getTestMongoUri(): string {
  const uri = process.env.TEST_MONGODB_URI;
  if (!uri) {
    throw new Error(
      "TEST_MONGODB_URI is not set. Integration tests require vitest globalSetup or a CI MongoDB service.",
    );
  }
  return uri;
}

async function ensureConnected(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(getTestMongoUri()).then(() => undefined);
  }

  await connectPromise;
}

export async function connectIntegrationDb(): Promise<void> {
  connectionRefCount += 1;
  await ensureConnected();
}

export async function disconnectIntegrationDb(): Promise<void> {
  connectionRefCount = Math.max(0, connectionRefCount - 1);
  if (connectionRefCount > 0) {
    return;
  }

  connectPromise = undefined;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function clearIntegrationCollections(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
}
