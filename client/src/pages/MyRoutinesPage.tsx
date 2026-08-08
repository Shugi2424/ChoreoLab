import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { formatCopValue } from "../utils/formatCopValue";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DELETE_ROUTINE_MUTATION } from "../graphql/mutations";
import { ROUTINES_QUERY } from "../graphql/queries";
import type { Routine } from "../types/routine";
import {
  formatAgeCategory,
  formatApparatus,
} from "../types/routine";
import { getGraphQLErrorMessage } from "../utils/graphqlErrors";

export function MyRoutinesPage() {
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" color="secondary.main" gutterBottom>
            My Routines
          </Typography>
          <Typography color="text.secondary">
            Click a row to open. Use the delete icon to remove a routine.
          </Typography>
        </Box>
        <Button component={RouterLink} to="/routines/new" variant="contained" color="primary">
          Create Routine
        </Button>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {routines.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No routines yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first routine to start building a timeline.
          </Typography>
          <Button component={RouterLink} to="/routines/new" variant="contained" color="primary">
            Create your first routine
          </Button>
        </Paper>
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
                  <TableCell>
                    {routine.validation.isValid ? "Valid" : "Incomplete"}
                  </TableCell>
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
