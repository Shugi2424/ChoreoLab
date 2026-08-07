import {
  authService,
  type LoginInput,
  type ResetPasswordInput,
  type SignUpInput,
} from "../services/authService.js";
import { coachService, type UpdateProfileInput } from "../services/coachService.js";
import type { GraphQLContext } from "../types/context.js";
import { requireAuth } from "../utils/errors.js";

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

  forgotPassword: (
    _: unknown,
    { email }: { email: string },
    context: GraphQLContext,
  ) => authService.forgotPassword(email, context.emailConfig),

  resetPassword: (_: unknown, { input }: { input: ResetPasswordInput }) =>
    authService.resetPassword(input),

  updateProfile: (
    _: unknown,
    { input }: { input: UpdateProfileInput },
    context: GraphQLContext,
  ) => coachService.updateProfile(requireAuth(context), input),

  changePassword: (
    _: unknown,
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    context: GraphQLContext,
  ) =>
    coachService.changePassword(requireAuth(context), currentPassword, newPassword),
};
