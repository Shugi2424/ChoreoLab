export const mutationTypeDefs = `#graphql
  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    forgotPassword(email: String!): MessagePayload!
    resetPassword(input: ResetPasswordInput!): MessagePayload!
    updateProfile(input: UpdateProfileInput!): Coach!
    changePassword(currentPassword: String!, newPassword: String!): MessagePayload!
  }
`;
