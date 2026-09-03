import { Alert, Box, Grid } from "@mui/material";
import { useQuery } from "@apollo/client";
import { useAuth } from "../auth/AuthContext";
import { NavCard } from "../components/layout/PlaceholderPage";
import { DashboardSkeleton } from "../components/layout/PageLoading";
import { PageHeader } from "../components/layout/PageHeader";
import { ROUTINES_QUERY } from "../graphql/queries";
import type { Routine } from "../types/routine";

export function DashboardPage() {
  const { coach } = useAuth();
  const { data: routinesData, loading, error } = useQuery<{ routines: Routine[] }>(
    ROUTINES_QUERY,
    { fetchPolicy: "cache-first" },
  );

  const routineCount = routinesData?.routines.length ?? 0;

  if (loading && !routinesData) {
    return <DashboardSkeleton />;
  }

  return (
    <Box>
      <PageHeader
        title="Home"
        subtitle={
          coach ? (
            <>
              Welcome back, {coach.firstName}.
              <br />
              Build competition routines with live DB and DA scoring, and CoP validation.
            </>
          ) : (
            "Build competition routines with live DB and DA scoring, and CoP validation."
          )
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not load routines. Check that the server is running.
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
