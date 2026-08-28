import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4 },
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: action ? 3 : 0, maxWidth: 420, mx: "auto" }}>
        {description}
      </Typography>
      {action ? <Box>{action}</Box> : null}
    </Paper>
  );
}
