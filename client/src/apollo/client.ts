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

export const BODY_ELEMENTS_QUERY = gql`
  query BodyElements {
    bodyElements {
      id
      name
      category
      value
    }
  }
`;

export const REQUIREMENTS_QUERY = gql`
  query Requirements($ageCategory: AgeCategory!) {
    requirements(ageCategory: $ageCategory) {
      id
      ageCategory
      DB {
        minElements
        maxElements
        requiredElements
        maxRisks
      }
      DA {
        minMasteries
        maxMasteries
        maxAcrobatics
      }
      A {
        minCharacterMoves
        minDanceSteps
        minDynamicEffects
      }
    }
  }
`;
