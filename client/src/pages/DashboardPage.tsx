import { Alert, Box, Grid, Typography } from "@mui/material";
import { useQuery } from "@apollo/client";
import { useAuth } from "../auth/AuthContext";
import { NavCard } from "../components/layout/PlaceholderPage";
import { HEALTH_QUERY, ROUTINES_QUERY } from "../graphql/queries";
import type { Routine } from "../types/routine";

export function DashboardPage() {
  const { coach } = useAuth();
  const { data, loading, error } = useQuery(HEALTH_QUERY);
  const { data: routinesData } = useQuery<{ routines: Routine[] }>(ROUTINES_QUERY);

  const routineCount = routinesData?.routines.length ?? 0;

  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {coach
          ? `Welcome back, ${coach.firstName}. Build competition routines with live DB, DA, and CoP validation.`
          : "Build competition routines with live DB, DA, and CoP validation."}
      </Typography>

      {loading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Checking API connection…
        </Typography>
      )}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not reach the API. Start the server with <code>npm run dev</code> in{" "}
          <code>server/</code>.
        </Alert>
      )}
      {data?.health && (
        <Alert severity="success" sx={{ mb: 3 }}>
          API connected — {data.health}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <NavCard
            title="Create Routine"
            description="Start a new routine for a gymnast."
            to="/routines/new"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <NavCard
            title="My Routines"
            description="Open, edit, or delete saved routines."
            to="/routines"
            badge={routineCount}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <NavCard
            title="Profile"
            description="Manage your coach profile and password."
            to="/profile"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
