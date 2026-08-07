export const objectTypeDefs = `#graphql
  type BodyElement {
    id: ID!
    name: String!
    category: BodyCategory!
    value: Float!
  }

  type DBRequirements {
    minElements: Int!
    maxElements: Int!
    requiredElements: [BodyCategory!]!
    maxRisks: Int!
  }

  type DARequirements {
    minMasteries: Int!
    maxMasteries: Int!
    maxAcrobatics: Int!
  }

  type ArtistryRequirements {
    minCharacterMoves: Int!
    minDanceSteps: Int!
    minDynamicEffects: Int!
  }

  type Requirement {
    id: ID!
    ageCategory: AgeCategory!
    DB: DBRequirements!
    DA: DARequirements!
    A: ArtistryRequirements!
  }

  type DACriteria {
    id: ID!
    name: String!
  }

  type Base {
    id: ID!
    name: String!
    value: Float!
    apparatuses: [Apparatus!]!
    allowedCriteria: [ID!]!
  }

  type RCriteria {
    id: ID!
    name: String!
    type: RCriteriaType!
    value: Float!
    apparatuses: [Apparatus!]!
  }

  type Rotation {
    id: ID!
    name: String!
    group: String!
  }

  type ArtistryComponent {
    id: ID!
    name: String!
    type: ArtistryType!
  }
`;
