import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000";

export const client = new ApolloClient({
  uri: graphqlUri,
  cache: new InMemoryCache(),
});

export const HEALTH_QUERY = gql`
  query Health {
    health
  }
`;

export const ELEMENTS_QUERY = gql`
  query Elements {
    elements {
      id
      name
      code
      apparatus
      category
      difficulty
    }
  }
`;
