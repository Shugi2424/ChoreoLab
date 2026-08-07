import {
  authService,
  type LoginInput,
  type SignUpInput,
} from "../services/authService.js";
import type { GraphQLContext } from "../types/context.js";

export const mutationResolvers = {
  signUp: (
    _: unknown,
    { input }: { input: SignUpInput },
    context: GraphQLContext,
  ) => authService.signUp(input, context.jwtSecret),

  login: (
    _: unknown,
    { input }: { input: LoginInput },
    context: GraphQLContext,
  ) => authService.login(input, context.jwtSecret),
};
