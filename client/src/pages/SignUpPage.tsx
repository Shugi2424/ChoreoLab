import { Alert, TextField } from "@mui/material";
import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  AuthPageShell,
  AuthSubmitButton,
  AuthTextField,
} from "../components/auth/AuthPageShell";
import { SIGN_UP_MUTATION } from "../graphql/mutations";

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
  return "Could not create account.";
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { loginWithToken, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    club: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [signUp, { loading }] = useMutation(SIGN_UP_MUTATION);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const { data } = await signUp({
        variables: {
          input: {
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            club: form.club || undefined,
          },
        },
      });
      loginWithToken(data.signUp.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(getGraphQLErrorMessage(error));
    }
  };

  return (
    <AuthPageShell
      title="Sign up"
      subtitle="Create a coach account to start building routines."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <AuthTextField
          label="First name"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(event) =>
            setForm((current) => ({ ...current, firstName: event.target.value }))
          }
        />
        <AuthTextField
          label="Last name"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(event) =>
            setForm((current) => ({ ...current, lastName: event.target.value }))
          }
        />
        <AuthTextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        <TextField
          margin="normal"
          fullWidth
          label="Club (optional)"
          value={form.club}
          onChange={(event) =>
            setForm((current) => ({ ...current, club: event.target.value }))
          }
        />
        <AuthTextField
          label="Password"
          type="password"
          autoComplete="new-password"
          helperText="At least 8 characters"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
        />
        <AuthSubmitButton loading={loading} label="Create account" />
      </form>
    </AuthPageShell>
  );
}
