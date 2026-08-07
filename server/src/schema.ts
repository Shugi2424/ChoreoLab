export const typeDefs = `#graphql
  enum Apparatus {
    hoop
    ball
    clubs
    ribbon
    rope
  }

  enum BodyCategory {
    jump
    balance
    pivot
  }

  enum AgeCategory {
    senior
    junior
  }

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

  type Query {
    health: String!
    bodyElements(category: BodyCategory): [BodyElement!]!
    bodyElement(id: ID!): BodyElement
    requirements(ageCategory: AgeCategory!): Requirement
    daCriteria: [DACriteria!]!
    daCriterion(id: ID!): DACriteria
    bases(apparatus: Apparatus): [Base!]!
    base(id: ID!): Base
  }
`;
