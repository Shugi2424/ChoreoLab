import { Alert, Box, Link } from "@mui/material";
import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AuthPageShell,
  AuthSubmitButton,
  AuthTextField,
} from "../components/auth/AuthPageShell";
import { FORGOT_PASSWORD_MUTATION } from "../graphql/mutations";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { data } = await forgotPassword({ variables: { email } });
      setSuccessMessage(data.forgotPassword.message);
    } catch {
      setErrorMessage("Could not send reset email. Please try again.");
    }
  };

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
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
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthSubmitButton loading={loading} label="Send reset link" />
      </form>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Link component={RouterLink} to="/login" underline="hover">
          Back to login
        </Link>
      </Box>
    </AuthPageShell>
  );
}
