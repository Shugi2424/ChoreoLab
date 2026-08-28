import { alpha, Box } from "@mui/material";
import type { ReactNode } from "react";

export function AuthFormLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        backgroundImage: (theme) =>
          `radial-gradient(circle at 20% 10%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 45%), radial-gradient(circle at 80% 90%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 40%)`,
        p: 2,
      }}
    >
      {children}
    </Box>
  );
}
