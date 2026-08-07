import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      club
      createdAt
    }
  }
`;

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
