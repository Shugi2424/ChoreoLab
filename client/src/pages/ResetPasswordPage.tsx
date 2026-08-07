import { Alert } from "@mui/material";
import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  AuthPageShell,
  AuthSubmitButton,
  AuthTextField,
} from "../components/auth/AuthPageShell";
import { RESET_PASSWORD_MUTATION } from "../graphql/mutations";

function getGraphQLErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors) &&
    error.graphQLErrors[0]?.message
  ) {
    return String(error.graphQLErrors[0].message);
  }
  return "Could not reset password.";
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: { input: { token, password } },
      });
      setSuccessMessage(data.resetPassword.message);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (error) {
      setErrorMessage(getGraphQLErrorMessage(error));
    }
  };

  return (
    <AuthPageShell
      title="Reset password"
      subtitle="Choose a new password for your account."
      footerText="Remember your password?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <AuthTextField
          label="New password"
          type="password"
          autoComplete="new-password"
          helperText="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthTextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <AuthSubmitButton loading={loading} label="Reset password" />
      </form>
    </AuthPageShell>
  );
}
