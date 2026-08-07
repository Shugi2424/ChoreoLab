export const routineTypeDefs = `#graphql
  type MissingRequirement {
    id: ID!
    domain: String!
    message: String!
  }

  type ValidationResult {
    isValid: Boolean!
    dbValid: Boolean!
    daValid: Boolean!
    artistryValid: Boolean!
    missingRequirements: [MissingRequirement!]!
    calculatedAt: String!
  }

  type Routine {
    id: ID!
    gymnastName: String!
    apparatus: Apparatus!
    ageCategory: AgeCategory!
    timeline: [RoutineItem!]!
    dbScore: Float!
    daScore: Float!
    validation: ValidationResult!
    createdAt: String!
    updatedAt: String!
  }

  type RoutineItem {
    id: ID!
    type: RoutineItemType!
    order: Int!
  }

  enum RoutineItemType {
    body_element
    risk
    mastery
    artistry
  }

  input CreateRoutineInput {
    gymnastName: String!
    apparatus: Apparatus!
    ageCategory: AgeCategory!
  }
`;
