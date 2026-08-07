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

  enum RCriteriaType {
    throw
    catch
    general
  }

  enum ArtistryType {
    character
    dance
    dynamic
    effect
  }

  type ArtistryComponent {
    id: ID!
    name: String!
    type: ArtistryType!
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
    rCriteria(apparatus: Apparatus, type: RCriteriaType): [RCriteria!]!
    rCriterion(id: ID!): RCriteria
    rotations(group: String): [Rotation!]!
    rotation(id: ID!): Rotation
    artistryComponents(type: ArtistryType): [ArtistryComponent!]!
    artistryComponent(id: ID!): ArtistryComponent
  }
`;
