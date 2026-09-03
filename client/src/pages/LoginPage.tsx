import { Alert, Box, Link } from "@mui/material";
import { useMutation, useApolloClient } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  AuthPageShell,
  AuthSubmitButton,
  AuthTextField,
} from "../components/auth/AuthPageShell";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { ROUTINES_QUERY } from "../graphql/queries";
import { warmApiConnection } from "../utils/apiWarmup";
import { getLoginErrorMessage } from "../utils/loginErrors";

export function LoginPage() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { loginWithToken, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    warmApiConnection();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const { data } = await login({
        variables: { input: { email, password } },
      });
      loginWithToken(data.login.token, data.login.coach);
      navigate("/dashboard", { replace: true });
      void client.query({ query: ROUTINES_QUERY, fetchPolicy: "cache-first" });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };

  return (
    <AuthPageShell
      title="Login"
      subtitle="Sign in to build and manage your routines."
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkTo="/signup"
    >
      <form onSubmit={handleSubmit}>
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
        <AuthTextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Forgot password?
          </Link>
        </Box>
        <AuthSubmitButton loading={loading} label="Log in" />
      </form>
    </AuthPageShell>
  );
}
