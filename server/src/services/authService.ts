import crypto from "node:crypto";
import { Coach } from "../models/Coach.js";
import { sendPasswordResetEmail, type EmailConfig } from "./emailService.js";
import { UserInputError } from "../utils/errors.js";
import { signToken } from "../utils/jwt.js";
import { toGraphQLCoach } from "../utils/mappers.js";
import { comparePassword, hashPassword, validatePassword } from "../utils/password.js";
import {
  assertEmail,
  assertNonEmptyString,
  assertOptionalString,
  MAX_CLUB_LENGTH,
  MAX_NAME_LENGTH,
} from "../utils/inputValidation.js";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  club?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

function normalizeEmail(email: string): string {
  return assertEmail(email);
}

function validateSignUpInput(input: SignUpInput): {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  club?: string;
} {
  const email = normalizeEmail(input.email);
  const firstName = assertNonEmptyString(input.firstName, "First name", MAX_NAME_LENGTH);
  const lastName = assertNonEmptyString(input.lastName, "Last name", MAX_NAME_LENGTH);
  const club = assertOptionalString(input.club, "Club", MAX_CLUB_LENGTH);
  validatePassword(input.password);
  return { email, password: input.password, firstName, lastName, club };
}

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const authService = {
  async signUp(input: SignUpInput, jwtSecret: string) {
    const validated = validateSignUpInput(input);

    const existing = await Coach.findOne({ email: validated.email }).lean();
    if (existing) {
      throw new UserInputError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(validated.password);
    const coach = await Coach.create({
      email: validated.email,
      passwordHash,
      firstName: validated.firstName,
      lastName: validated.lastName,
      club: validated.club,
    });

    const token = signToken(coach._id.toString(), jwtSecret);
    return { token, coach: toGraphQLCoach(coach) };
  },

  async login(input: LoginInput, jwtSecret: string) {
    if (!input.email.trim() || !input.password) {
      throw new UserInputError("Email and password are required");
    }

    const email = input.email.trim().toLowerCase();
    if (!email) {
      throw new UserInputError("Invalid email or password");
    }

    const coach = await Coach.findOne({ email }).lean();
    if (!coach) {
      throw new UserInputError("Invalid email or password");
    }

    const valid = await comparePassword(input.password, coach.passwordHash);
    if (!valid) {
      throw new UserInputError("Invalid email or password");
    }

    const token = signToken(coach._id.toString(), jwtSecret);
    return { token, coach: toGraphQLCoach(coach) };
  },

  async getCoachById(coachId: string) {
    const coach = await Coach.findById(coachId).lean();
    return coach ? toGraphQLCoach(coach) : null;
  },

  async forgotPassword(email: string, emailConfig: EmailConfig) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return {
        message:
          "If an account exists for that email, a password reset link has been sent.",
      };
    }

    let normalizedEmail: string;
    try {
      normalizedEmail = normalizeEmail(trimmedEmail);
    } catch {
      return {
        message:
          "If an account exists for that email, a password reset link has been sent.",
      };
    }

    const coach = await Coach.findOne({ email: normalizedEmail });

    if (coach) {
      const resetToken = generateResetToken();
      coach.resetToken = hashResetToken(resetToken);
      coach.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
      await coach.save();
      await sendPasswordResetEmail(emailConfig, coach.email, resetToken);
    }

    return {
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };
  },

  async resetPassword(input: ResetPasswordInput) {
    if (!input.token.trim()) {
      throw new UserInputError("Reset token is required");
    }
    validatePassword(input.password);

    const hashedToken = hashResetToken(input.token.trim());
    const coach = await Coach.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!coach) {
      throw new UserInputError("Invalid or expired reset token");
    }

    coach.passwordHash = await hashPassword(input.password);
    coach.set({ resetToken: undefined, resetTokenExpiry: undefined });
    await coach.save();

    return { message: "Password reset successfully" };
  },
};
