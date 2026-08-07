export const queryTypeDefs = `#graphql
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
