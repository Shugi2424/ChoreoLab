export const mutationTypeDefs = `#graphql
  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    forgotPassword(email: String!): MessagePayload!
    resetPassword(input: ResetPasswordInput!): MessagePayload!
    updateProfile(input: UpdateProfileInput!): Coach!
    changePassword(currentPassword: String!, newPassword: String!): MessagePayload!
    createRoutine(input: CreateRoutineInput!): Routine!
    deleteRoutine(id: ID!): MessagePayload!
    addRoutineItem(routineId: ID!, input: AddRoutineItemInput!, insertIndex: Int): Routine!
    removeRoutineItem(routineId: ID!, itemId: ID!): Routine!
    reorderRoutineItems(routineId: ID!, itemIds: [ID!]!): Routine!
    updateRoutineItem(
      routineId: ID!
      itemId: ID!
      input: UpdateRoutineItemInput!
    ): Routine!
  }
`;
