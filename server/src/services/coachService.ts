import { Coach } from "../models/Coach.js";
import { UserInputError } from "../utils/errors.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { toGraphQLCoach } from "../utils/mappers.js";

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  club?: string;
}

export const coachService = {
  async updateProfile(coachId: string, input: UpdateProfileInput) {
    if (!input.firstName.trim()) {
      throw new UserInputError("First name is required");
    }
    if (!input.lastName.trim()) {
      throw new UserInputError("Last name is required");
    }

    const coach = await Coach.findByIdAndUpdate(
      coachId,
      {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        club: input.club?.trim() || undefined,
      },
      { new: true },
    );

    if (!coach) {
      throw new UserInputError("Coach not found");
    }

    return toGraphQLCoach(coach);
  },

  async changePassword(
    coachId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new UserInputError("Current and new password are required");
    }

    const coach = await Coach.findById(coachId);
    if (!coach) {
      throw new UserInputError("Coach not found");
    }

    const valid = await comparePassword(currentPassword, coach.passwordHash);
    if (!valid) {
      throw new UserInputError("Current password is incorrect");
    }

    coach.passwordHash = await hashPassword(newPassword);
    await coach.save();

    return { message: "Password updated successfully" };
  },
};
