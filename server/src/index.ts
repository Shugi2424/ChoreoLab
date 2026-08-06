import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { connectDb } from "./db.js";
import { resolvers } from "./resolvers/index.js";
import { typeDefs } from "./schema.js";

const PORT = Number(process.env.PORT ?? 4000);
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/choreolab";

async function main() {
  await connectDb(MONGODB_URI);

  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`GraphQL server ready at ${url}`);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
