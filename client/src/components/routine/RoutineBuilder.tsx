import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { useCallback, useState } from "react";
import {
  ADD_ROUTINE_ITEM_MUTATION,
  REORDER_ROUTINE_ITEMS_MUTATION,
  REMOVE_ROUTINE_ITEM_MUTATION,
  UPDATE_ROUTINE_ITEM_MUTATION,
} from "../../graphql/mutations";
import type { Routine, RoutineItemType } from "../../types/routine";
import { formatAgeCategory, formatApparatus } from "../../types/routine";
import { getGraphQLErrorMessage } from "../../utils/graphqlErrors";
import { EditingPanel, type EditingPanelSubmitPayload } from "./EditingPanel";
import { ScorePanel } from "./ScorePanel";
import { TimelinePanel } from "./TimelinePanel";

interface RoutineBuilderProps {
  routine: Routine;
}

type PanelMode = "empty" | "add" | "edit";

export function RoutineBuilder({ routine: initialRoutine }: RoutineBuilderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [routine, setRoutine] = useState(initialRoutine);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [addType, setAddType] = useState<RoutineItemType | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const panelMode: PanelMode =
    addType !== null ? "add" : selectedItemId ? "edit" : "empty";

  const selectedItem =
    routine.timeline.find((item) => item.id === selectedItemId) ?? null;

  const mutationOptions = {
    onError: (error: unknown) => {
      setErrorMessage(getGraphQLErrorMessage(error, "Something went wrong."));
    },
  };

  const [addItem, { loading: adding }] = useMutation(ADD_ROUTINE_ITEM_MUTATION, mutationOptions);
  const [updateItem, { loading: updating }] = useMutation(
    UPDATE_ROUTINE_ITEM_MUTATION,
    mutationOptions,
  );
  const [removeItem, { loading: removing }] = useMutation(
    REMOVE_ROUTINE_ITEM_MUTATION,
    mutationOptions,
  );
  const [reorderItems, { loading: reordering }] = useMutation(
    REORDER_ROUTINE_ITEMS_MUTATION,
    mutationOptions,
  );

  const busy = adding || updating || removing || reordering;

  const applyRoutineUpdate = useCallback((updated: Routine) => {
    setRoutine(updated);
    setErrorMessage(null);
  }, []);

  const handleAddSubmit = async (payload: EditingPanelSubmitPayload) => {
    if (!addType) {
      return;
    }
    const { data } = await addItem({
      variables: {
        routineId: routine.id,
        input: { type: addType, ...payload },
      },
    });
    const updated = data?.addRoutineItem as Routine | undefined;
    if (updated) {
      applyRoutineUpdate(updated);
      const newItem = updated.timeline[updated.timeline.length - 1];
      setAddType(null);
      setSelectedItemId(newItem?.id ?? null);
    }
  };

  const handleEditSubmit = async (payload: EditingPanelSubmitPayload) => {
    if (!selectedItemId) {
      return;
    }
    const { data } = await updateItem({
      variables: {
        routineId: routine.id,
        itemId: selectedItemId,
        input: payload,
      },
    });
    const updated = data?.updateRoutineItem as Routine | undefined;
    if (updated) {
      applyRoutineUpdate(updated);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeItemId) {
      return;
    }
    const { data } = await removeItem({
      variables: { routineId: routine.id, itemId: removeItemId },
    });
    const updated = data?.removeRoutineItem as Routine | undefined;
    if (updated) {
      applyRoutineUpdate(updated);
      if (selectedItemId === removeItemId) {
        setSelectedItemId(null);
      }
    }
    setRemoveItemId(null);
  };

  const handleReorder = async (itemIds: string[]) => {
    const { data } = await reorderItems({
      variables: { routineId: routine.id, itemIds },
    });
    const updated = data?.reorderRoutineItems as Routine | undefined;
    if (updated) {
      applyRoutineUpdate(updated);
    }
  };

  const handleMoveItem = async (itemId: string, direction: "up" | "down") => {
    const items = [...routine.timeline].sort((a, b) => a.order - b.order);
    const index = items.findIndex((item) => item.id === itemId);
    if (index < 0) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }
    const ids = items.map((item) => item.id);
    [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
    await handleReorder(ids);
  };

  const scoreSection = <ScorePanel routine={routine} />;
  const timelineSection = (
    <TimelinePanel
      routine={routine}
      selectedItemId={selectedItemId}
      onSelectItem={(id) => {
        setAddType(null);
        setSelectedItemId(id);
      }}
      onAddItem={(type) => {
        setSelectedItemId(null);
        setAddType(type);
      }}
      onRemoveItem={setRemoveItemId}
      onMoveItem={handleMoveItem}
      onReorder={handleReorder}
      busy={busy}
    />
  );
  const editingSection = (
    <EditingPanel
      apparatus={routine.apparatus}
      mode={panelMode}
      itemType={addType}
      selectedItem={selectedItem}
      onSubmit={panelMode === "add" ? handleAddSubmit : handleEditSubmit}
      busy={busy}
    />
  );

  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        {routine.gymnastName}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {formatApparatus(routine.apparatus)} · {formatAgeCategory(routine.ageCategory)}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ minHeight: 480 }}>
        {isMobile ? (
          <>
            <Grid size={12}>{scoreSection}</Grid>
            <Grid size={12}>{timelineSection}</Grid>
            <Grid size={12}>{editingSection}</Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, md: 3 }}>{timelineSection}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{editingSection}</Grid>
            <Grid size={{ xs: 12, md: 3 }}>{scoreSection}</Grid>
          </>
        )}
      </Grid>

      <Dialog open={removeItemId !== null} onClose={() => setRemoveItemId(null)}>
        <DialogTitle>Remove timeline item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the item from the routine timeline. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveItemId(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleRemoveConfirm} disabled={busy}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
