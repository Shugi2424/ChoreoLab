import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AuthFormLayout } from "./AuthFormLayout";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
}

export function AuthPageShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthPageShellProps) {
  return (
    <AuthFormLayout>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 440 }}>
        <Typography variant="h4" color="secondary.main" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
        {children}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography component="span" color="text.secondary">
            {footerText}{" "}
          </Typography>
          <Link component={RouterLink} to={footerLinkTo} underline="hover">
            {footerLinkLabel}
          </Link>
        </Box>
      </Paper>
    </AuthFormLayout>
  );
}

export function AuthSubmitButton({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      fullWidth
      size="large"
      disabled={loading}
      sx={{ mt: 2 }}
    >
      {loading ? "Please wait…" : label}
    </Button>
  );
}

export function AuthTextField(props: React.ComponentProps<typeof TextField>) {
  return <TextField margin="normal" fullWidth required {...props} />;
}
