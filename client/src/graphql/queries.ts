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

export const ROUTINES_QUERY = gql`
  query Routines {
    routines {
      id
      gymnastName
      apparatus
      ageCategory
      dbScore
      daScore
      validation {
        isValid
      }
      updatedAt
    }
  }
`;

export const ROUTINE_QUERY = gql`
  query Routine($id: ID!) {
    routine(id: $id) {
      id
      gymnastName
      apparatus
      ageCategory
      dbScore
      daScore
      validation {
        isValid
        dbValid
        daValid
        artistryValid
        missingRequirements {
          id
          domain
          message
        }
        calculatedAt
      }
      timeline {
        id
        type
        order
        bodyElementId
        bodyElement {
          id
          name
          category
          value
        }
        risk {
          criteriaIds
          rotations {
            rotationId
            count
          }
          bodyElementId
          value
        }
        mastery {
          baseIds
          criteriaIds
          rotationId
          value
          isAcro
        }
        artistryComponentId
        artistryComponent {
          id
          name
          type
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const BASES_QUERY = gql`
  query Bases($apparatus: Apparatus) {
    bases(apparatus: $apparatus) {
      id
      name
      value
      apparatuses
      allowedCriteria
    }
  }
`;

export const DA_CRITERIA_QUERY = gql`
  query DaCriteria {
    daCriteria {
      id
      name
    }
  }
`;

export const R_CRITERIA_QUERY = gql`
  query RCriteria($apparatus: Apparatus) {
    rCriteria(apparatus: $apparatus) {
      id
      name
      type
      value
      apparatuses
    }
  }
`;

export const ROTATIONS_QUERY = gql`
  query Rotations {
    rotations {
      id
      name
      group
    }
  }
`;

export const ARTISTRY_COMPONENTS_QUERY = gql`
  query ArtistryComponents {
    artistryComponents {
      id
      name
      type
    }
  }
`;
