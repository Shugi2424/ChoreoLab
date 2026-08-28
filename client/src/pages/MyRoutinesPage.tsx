import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { formatCopValue } from "../utils/formatCopValue";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/layout/EmptyState";
import { PageHeader } from "../components/layout/PageHeader";
import { RoutinesListSkeleton } from "../components/layout/PageLoading";
import { DELETE_ROUTINE_MUTATION } from "../graphql/mutations";
import { ROUTINES_QUERY } from "../graphql/queries";
import type { Routine } from "../types/routine";
import { formatAgeCategory, formatApparatus } from "../types/routine";
import { getGraphQLErrorMessage } from "../utils/graphqlErrors";
import { touchIconButtonSx } from "../theme/touchTargets";

function RoutineCard({
  routine,
  onOpen,
  onDelete,
}: {
  routine: Routine;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent onClick={onOpen} sx={{ cursor: "pointer", pb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
          {routine.gymnastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {formatApparatus(routine.apparatus)} · {formatAgeCategory(routine.ageCategory)}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip
            size="small"
            label={`DB ${formatCopValue(routine.dbScore)}`}
            variant="outlined"
            sx={{ fontWeight: 700, color: "text.primary", borderColor: "divider" }}
          />
          <Chip
            size="small"
            label={`DA ${formatCopValue(routine.daScore)}`}
            variant="outlined"
            sx={{ fontWeight: 700, color: "text.primary", borderColor: "divider" }}
          />
          <Chip
            size="small"
            label={routine.validation.isValid ? "Valid" : "Incomplete"}
            color={routine.validation.isValid ? "success" : "warning"}
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={onOpen}>
          Open
        </Button>
        <IconButton
          color="error"
          aria-label={`Delete routine for ${routine.gymnastName}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          sx={touchIconButtonSx}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export function MyRoutinesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery<{ routines: Routine[] }>(
    ROUTINES_QUERY,
    { fetchPolicy: "network-only" },
  );
  const [deleteRoutine, { loading: deleting }] = useMutation(DELETE_ROUTINE_MUTATION);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const routines = data?.routines ?? [];

  const handleDeleteConfirm = async () => {
    if (!routineToDelete) return;
    setDeleteError(null);

    try {
      await deleteRoutine({ variables: { id: routineToDelete.id } });
      setRoutineToDelete(null);
      await refetch();
    } catch (err) {
      setDeleteError(getGraphQLErrorMessage(err, "Could not delete routine."));
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="My Routines" subtitle="Loading your saved routines…" />
        <RoutinesListSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Could not load routines. Please try again.</Alert>
    );
  }

  return (
    <Box>
      <PageHeader
        title="My Routines"
        subtitle={
          isMobile
            ? "Tap a routine to open it."
            : "Click a row to open. Use the delete icon to remove a routine."
        }
        action={
          <Button
            component={RouterLink}
            to="/routines/new"
            variant="contained"
            color="primary"
            sx={{ minHeight: isMobile ? 44 : undefined }}
          >
            Create Routine
          </Button>
        }
      />

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {routines.length === 0 ? (
        <EmptyState
          title="No routines yet"
          description="Create your first routine to start building a timeline with live CoP scoring."
          action={
            <Button component={RouterLink} to="/routines/new" variant="contained" color="primary">
              Create your first routine
            </Button>
          }
        />
      ) : isMobile ? (
        <Box>
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onOpen={() => navigate(`/routines/${routine.id}`)}
              onDelete={() => setRoutineToDelete(routine)}
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Gymnast</TableCell>
                <TableCell>Apparatus</TableCell>
                <TableCell>Age category</TableCell>
                <TableCell align="right">DB</TableCell>
                <TableCell align="right">DA</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" sx={{ width: 56 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {routines.map((routine) => (
                <TableRow
                  key={routine.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/routines/${routine.id}`)}
                >
                  <TableCell>{routine.gymnastName}</TableCell>
                  <TableCell>{formatApparatus(routine.apparatus)}</TableCell>
                  <TableCell>{formatAgeCategory(routine.ageCategory)}</TableCell>
                  <TableCell align="right">{formatCopValue(routine.dbScore)}</TableCell>
                  <TableCell align="right">{formatCopValue(routine.daScore)}</TableCell>
                  <TableCell>{routine.validation.isValid ? "Valid" : "Incomplete"}</TableCell>
                  <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                    <Tooltip title="Delete routine">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Delete routine for ${routine.gymnastName}`}
                        onClick={() => setRoutineToDelete(routine)}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(routineToDelete)} onClose={() => setRoutineToDelete(null)}>
        <DialogTitle>Delete routine?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the routine for{" "}
            <strong>{routineToDelete?.gymnastName}</strong>. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoutineToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
