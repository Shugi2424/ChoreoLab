import { getGraphQLErrorMessage } from "./graphqlErrors.js";

export function getLoginErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "networkError" in error &&
    (error as { networkError?: unknown }).networkError != null
  ) {
    return "Cannot reach the server. Make sure the API is running on port 4000.";
  }
  return getGraphQLErrorMessage(error, "Invalid email or password.");
}
