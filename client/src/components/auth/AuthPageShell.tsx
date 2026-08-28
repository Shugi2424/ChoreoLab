import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Logo } from "../brand/Logo";
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
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 12px 40px rgba(109, 91, 215, 0.08)",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Logo variant="dark" size="md" />
        </Box>
        <Typography variant="h4" gutterBottom>
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

export function AuthTextField({ sx, ...props }: React.ComponentProps<typeof TextField>) {
  return (
    <TextField
      margin="normal"
      fullWidth
      required
      sx={{
        "& .MuiInputBase-input": { fontSize: { xs: "16px", sm: "1rem" } },
        ...sx,
      }}
      {...props}
    />
  );
}
