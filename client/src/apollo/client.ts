import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getStoredToken } from "../auth/tokenStorage";

const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const httpLink = createHttpLink({ uri: graphqlUri });

const authLink = setContext((_, { headers }) => {
  const token = getStoredToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
