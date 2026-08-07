import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../types/context.js";

export class AuthenticationError extends GraphQLError {
  constructor(message = "Not authenticated") {
    super(message, { extensions: { code: "UNAUTHENTICATED" } });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = "Forbidden") {
    super(message, { extensions: { code: "FORBIDDEN" } });
  }
}

export class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: "BAD_USER_INPUT" } });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message = "Not found") {
    super(message, { extensions: { code: "NOT_FOUND" } });
  }
}

export function requireAuth(context: GraphQLContext): string {
  if (!context.coachId) {
    throw new AuthenticationError();
  }
  return context.coachId;
}
