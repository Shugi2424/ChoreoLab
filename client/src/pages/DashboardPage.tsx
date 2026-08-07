import { Alert, Box, Grid, Typography } from "@mui/material";
import { useQuery } from "@apollo/client";
import { NavCard } from "../components/layout/PlaceholderPage";
import { HEALTH_QUERY } from "../graphql/queries";

export function DashboardPage() {
  const { data, loading, error } = useQuery(HEALTH_QUERY);

  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Build competition routines with live DB, DA, and CoP validation.
      </Typography>

      {loading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Checking API connection…
        </Typography>
      )}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not reach the API. Start the server with{" "}
          <code>npm run dev</code> in <code>server/</code>.
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
