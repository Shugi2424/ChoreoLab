import bcrypt from "bcrypt";
import { Coach } from "../models/Coach.js";
import { UserInputError } from "../utils/errors.js";
import { signToken } from "../utils/jwt.js";
import { toGraphQLCoach } from "../utils/mappers.js";

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new UserInputError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
}

function validateSignUpInput(input: SignUpInput): void {
  if (!input.email.trim()) {
    throw new UserInputError("Email is required");
  }
  if (!input.firstName.trim()) {
    throw new UserInputError("First name is required");
  }
  if (!input.lastName.trim()) {
    throw new UserInputError("Last name is required");
  }
  validatePassword(input.password);
}

export const authService = {
  async signUp(input: SignUpInput, jwtSecret: string) {
    validateSignUpInput(input);

    const email = normalizeEmail(input.email);
    const existing = await Coach.findOne({ email }).lean();
    if (existing) {
      throw new UserInputError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const coach = await Coach.create({
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      club: input.club?.trim() || undefined,
    });

    const token = signToken(coach._id.toString(), jwtSecret);
    return { token, coach: toGraphQLCoach(coach) };
  },

  async login(input: LoginInput, jwtSecret: string) {
    if (!input.email.trim() || !input.password) {
      throw new UserInputError("Email and password are required");
    }

    const email = normalizeEmail(input.email);
    const coach = await Coach.findOne({ email });
    if (!coach) {
      throw new UserInputError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, coach.passwordHash);
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
};
