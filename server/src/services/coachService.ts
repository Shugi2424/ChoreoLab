import { Coach } from "../models/Coach.js";
import { UserInputError } from "../utils/errors.js";
import { comparePassword, hashPassword, validatePassword } from "../utils/password.js";
import {
  assertNonEmptyString,
  assertOptionalString,
  MAX_CLUB_LENGTH,
  MAX_NAME_LENGTH,
} from "../utils/inputValidation.js";
import { toGraphQLCoach } from "../utils/mappers.js";

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  club?: string;
}

export const coachService = {
  async updateProfile(coachId: string, input: UpdateProfileInput) {
    const firstName = assertNonEmptyString(input.firstName, "First name", MAX_NAME_LENGTH);
    const lastName = assertNonEmptyString(input.lastName, "Last name", MAX_NAME_LENGTH);
    const club = assertOptionalString(input.club, "Club", MAX_CLUB_LENGTH);

    const coach = await Coach.findByIdAndUpdate(
      coachId,
      {
        firstName,
        lastName,
        club,
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

    validatePassword(newPassword);
    coach.passwordHash = await hashPassword(newPassword);
    await coach.save();

    return { message: "Password updated successfully" };
  },
};
