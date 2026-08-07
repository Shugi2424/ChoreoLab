import { Box } from "@mui/material";
import type { ReactNode } from "react";

export function AuthFormLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      {children}
    </Box>
  );
}
