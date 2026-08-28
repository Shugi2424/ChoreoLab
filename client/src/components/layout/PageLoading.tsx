import { Box, CircularProgress, Skeleton, Typography } from "@mui/material";

interface PageLoadingProps {
  label?: string;
}

export function PageLoading({ label }: PageLoadingProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        gap: 2,
      }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress color="primary" />
      {label ? (
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
      ) : null}
    </Box>
  );
}

export function RoutinesListSkeleton() {
  return (
    <Box aria-hidden>
      <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={120} />
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <Box aria-hidden>
      <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={28} sx={{ mb: 3 }} />
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
      </Box>
    </Box>
  );
}
