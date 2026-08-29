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

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new UserInputError("Password must include at least one letter and one number");
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
