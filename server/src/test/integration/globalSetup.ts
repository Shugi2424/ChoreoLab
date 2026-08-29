import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | undefined;

export default async function globalSetup() {
  if (process.env.TEST_MONGODB_URI) {
    return;
  }

  memoryServer = await MongoMemoryServer.create({
    binary: { version: "6.0.9" },
    instance: { launchTimeout: 600_000 },
  });

  process.env.TEST_MONGODB_URI = memoryServer.getUri();

  return async () => {
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = undefined;
    }
  };
}
