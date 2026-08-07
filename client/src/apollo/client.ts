import { ApolloClient, InMemoryCache } from "@apollo/client";

const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export const client = new ApolloClient({
  uri: graphqlUri,
  cache: new InMemoryCache(),
});
