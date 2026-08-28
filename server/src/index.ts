import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express, { type RequestHandler } from "express";
import http from "node:http";
import { loadConfig } from "./config/env.js";
import { connectDb, disconnectDb, isDbConnected } from "./db.js";
import { buildGraphQLContext } from "./middleware/context.js";
import { resolvers } from "./resolvers/index.js";
import { typeDefs } from "./schema/index.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main() {
  const config = loadConfig();
  await connectDb(config.mongodbUri);

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.get("/health", (_req, res) => {
    const dbConnected = isDbConnected();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? "ok" : "degraded",
      service: "choreolab-api",
      db: dbConnected ? "connected" : "disconnected",
    });
  });

  app.use(
    "/graphql",
    cors({ origin: config.corsOrigin, credentials: true }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => buildGraphQLContext(req, config),
    }) as unknown as RequestHandler,
  );

  await new Promise<void>((resolve) => {
    httpServer.listen(config.port, resolve);
  });

  console.log(`Health check ready at http://localhost:${config.port}/health`);
  console.log(`GraphQL ready at http://localhost:${config.port}/graphql`);

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`${signal} received — shutting down`);

    const forceExit = setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      await server.stop();
      await disconnectDb();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
      clearTimeout(forceExit);
      process.exit(0);
    } catch (err) {
      console.error("Shutdown error:", err);
      clearTimeout(forceExit);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
