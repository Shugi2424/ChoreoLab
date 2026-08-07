import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { FormEvent, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CREATE_ROUTINE_MUTATION } from "../graphql/mutations";
import { ROUTINE_QUERY } from "../graphql/queries";
import type { AgeCategory, Apparatus, Routine } from "../types/routine";
import {
  AGE_CATEGORY_OPTIONS,
  APPARATUS_OPTIONS,
  formatAgeCategory,
  formatApparatus,
} from "../types/routine";

function getGraphQLErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors) &&
    error.graphQLErrors[0]?.message
  ) {
    return String(error.graphQLErrors[0].message);
  }
  return fallback;
}

function CreateRoutineForm() {
  const navigate = useNavigate();
  const [gymnastName, setGymnastName] = useState("");
  const [apparatus, setApparatus] = useState<Apparatus>("hoop");
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("senior");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [createRoutine, { loading }] = useMutation(CREATE_ROUTINE_MUTATION, {
    refetchQueries: ["Routines"],
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const { data } = await createRoutine({
        variables: {
          input: { gymnastName, apparatus, ageCategory },
        },
      });
      navigate(`/routines/${data.createRoutine.id}`, { replace: true });
    } catch (error) {
      setErrorMessage(getGraphQLErrorMessage(error, "Could not create routine."));
    }
  };

  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        Create Routine
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Enter the gymnast details to start building a routine.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            margin="normal"
            fullWidth
            required
            label="Gymnast name"
            value={gymnastName}
            onChange={(event) => setGymnastName(event.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            select
            label="Apparatus"
            value={apparatus}
            onChange={(event) => setApparatus(event.target.value as Apparatus)}
          >
            {APPARATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="normal"
            fullWidth
            required
            select
            label="Age category"
            value={ageCategory}
            onChange={(event) => setAgeCategory(event.target.value as AgeCategory)}
          >
            {AGE_CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? "Creating…" : "Start Building"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

function RoutineDetailView({ routine }: { routine: Routine }) {
  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        {routine.gymnastName}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {formatApparatus(routine.apparatus)} · {formatAgeCategory(routine.ageCategory)}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scores
        </Typography>
        <Typography>
          DB: <strong>{routine.dbScore.toFixed(1)}</strong> · DA:{" "}
          <strong>{routine.daScore.toFixed(1)}</strong>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Status: {routine.validation.isValid ? "Valid" : "Incomplete"}
        </Typography>
      </Paper>

      <Alert severity="info">
        The timeline builder with drag-and-drop reordering will be available in Milestone 5.
      </Alert>
    </Box>
  );
}

export function RoutineBuilderPage() {
  const { id } = useParams();
  const isNew = id === "new";

  const { data, loading, error } = useQuery<{ routine: Routine }>(ROUTINE_QUERY, {
    variables: { id: id ?? "" },
    skip: isNew || !id,
    fetchPolicy: "network-only",
  });

  if (isNew) {
    return <CreateRoutineForm />;
  }

  if (!id) {
    return <Navigate to="/routines" replace />;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !data?.routine) {
    return (
      <Alert severity="error">
        Routine not found or you do not have access to it.
      </Alert>
    );
  }

  return <RoutineDetailView routine={data.routine} />;
}
