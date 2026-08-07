import bcrypt from "bcrypt";
import { UserInputError } from "./errors.js";

export const BCRYPT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new UserInputError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
