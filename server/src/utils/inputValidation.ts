import { Types } from "mongoose";
import { UserInputError } from "./errors.js";

export const MAX_EMAIL_LENGTH = 254;
export const MAX_NAME_LENGTH = 100;
export const MAX_CLUB_LENGTH = 200;
export const MAX_GYMNAST_NAME_LENGTH = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertNonEmptyString(
  value: string,
  fieldName: string,
  maxLength: number,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new UserInputError(`${fieldName} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new UserInputError(`${fieldName} is too long`);
  }
  return trimmed;
}

export function assertOptionalString(
  value: string | undefined,
  fieldName: string,
  maxLength: number,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > maxLength) {
    throw new UserInputError(`${fieldName} is too long`);
  }
  return trimmed;
}

export function assertEmail(email: string): string {
  const normalized = assertNonEmptyString(email, "Email", MAX_EMAIL_LENGTH).toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new UserInputError("Invalid email address");
  }
  return normalized;
}

export function assertObjectId(id: string, fieldName: string): string {
  const trimmed = id.trim();
  if (!trimmed || !Types.ObjectId.isValid(trimmed)) {
    throw new UserInputError(`Invalid ${fieldName}`);
  }
  return trimmed;
}
