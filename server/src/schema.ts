export const typeDefs = `#graphql
  enum Apparatus {
    hoop
    ball
    clubs
    ribbon
    rope
    none
  }

  type Element {
    id: ID!
    name: String!
    code: String!
    apparatus: Apparatus!
    category: String!
    difficulty: Float!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    health: String!
    elements(apparatus: Apparatus): [Element!]!
    element(id: ID!): Element
  }
`;
