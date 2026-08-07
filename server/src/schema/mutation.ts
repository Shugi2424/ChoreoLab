export const mutationTypeDefs = `#graphql
  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }
`;
