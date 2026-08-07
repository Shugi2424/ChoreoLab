import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express, { type RequestHandler } from "express";
import http from "node:http";
import { loadConfig } from "./config/env.js";
import { connectDb } from "./db.js";
import { buildGraphQLContext } from "./middleware/context.js";
import { resolvers } from "./resolvers/index.js";
import { typeDefs } from "./schema/index.js";

async function main() {
  const config = loadConfig();
  await connectDb(config.mongodbUri);

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "choreolab-api" });
  });

  app.use(
    "/graphql",
    cors({ origin: config.corsOrigin, credentials: true }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => buildGraphQLContext(req, config.jwtSecret),
    }) as unknown as RequestHandler,
  );

  await new Promise<void>((resolve) => {
    httpServer.listen(config.port, resolve);
  });

  console.log(`Health check ready at http://localhost:${config.port}/health`);
  console.log(`GraphQL ready at http://localhost:${config.port}/graphql`);

  const shutdown = async (signal: string) => {
    console.log(`${signal} received — shutting down`);
    await server.stop();
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
