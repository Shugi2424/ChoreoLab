export const routineTypeDefs = `#graphql
  type MissingRequirement {
    id: ID!
    domain: String!
    message: String!
  }

  type ValidationWarning {
    id: ID!
    domain: String!
    severity: String!
    message: String!
  }

  type ValidationResult {
    isValid: Boolean!
    dbValid: Boolean!
    daValid: Boolean!
    artistryValid: Boolean!
    missingRequirements: [MissingRequirement!]!
    warnings: [ValidationWarning!]!
    calculatedAt: String!
  }

  type BodyElementConfig {
    rotationCount: Int
    value: Float!
  }

  type RiskRotation {
    rotationId: ID!
    count: Int!
  }

  type Risk {
    criteriaIds: [ID!]!
    rotations: [RiskRotation!]!
    value: Float!
  }

  type Mastery {
    baseIds: [ID!]!
    criteriaIds: [ID!]!
    rotationId: ID
    value: Float!
    isAcro: Boolean!
  }

  type RoutineItem {
    id: ID!
    type: RoutineItemType!
    order: Int!
    bodyElementId: ID
    bodyElement: BodyElement
    bodyElementConfig: BodyElementConfig
    risk: Risk
    mastery: Mastery
    artistryComponentId: ID
    artistryComponent: ArtistryComponent
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

  input RiskRotationInput {
    rotationId: ID!
    count: Int!
  }

  input RiskInput {
    criteriaIds: [ID!]!
    rotations: [RiskRotationInput!]!
  }

  input MasteryInput {
    baseIds: [ID!]!
    criteriaIds: [ID!]!
    rotationId: ID
  }

  input AddRoutineItemInput {
    type: RoutineItemType!
    bodyElementId: ID
    rotationCount: Int
    risk: RiskInput
    mastery: MasteryInput
    artistryComponentId: ID
  }

  input UpdateRoutineItemInput {
    bodyElementId: ID
    rotationCount: Int
    risk: RiskInput
    mastery: MasteryInput
    artistryComponentId: ID
  }
`;
