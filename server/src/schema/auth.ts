export const authTypeDefs = `#graphql
  type Coach {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    club: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    coach: Coach!
  }

  input SignUpInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    club: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String!
    lastName: String!
    club: String
  }

  type MessagePayload {
    message: String!
  }
`;
