import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation } from "@apollo/client";
import { useCallback, useState } from "react";
import {
  ADD_ROUTINE_ITEM_MUTATION,
  REORDER_ROUTINE_ITEMS_MUTATION,
  REMOVE_ROUTINE_ITEM_MUTATION,
  UPDATE_ROUTINE_ITEM_MUTATION,
} from "../../graphql/mutations";
import type { Routine, RoutineItemType } from "../../types/routine";
import {
  formatAgeCategory,
  formatApparatus,
  getRoutineItemLabel,
  getRoutineItemTypeLabel,
  TIMELINE_TYPE_COLORS,
} from "../../types/routine";
import { getGraphQLErrorMessage } from "../../utils/graphqlErrors";
import { InventoryPanel, type EditingPanelSubmitPayload } from "./InventoryPanel";
import { ScorePanel } from "./ScorePanel";
import { TimelinePanel, useTimelineOrder } from "./TimelinePanel";

interface RoutineBuilderProps {
  routine: Routine;
}

const PERSIST_ADD_TYPES = new Set<RoutineItemType>(["body_element", "artistry"]);

interface DragPreview {
  label: string;
  subtitle?: string;
  color?: string;
}

function getTimelineInsertIndex(overId: unknown, localItemIds: string[]): number | undefined {
  if (overId == null) {
    return undefined;
  }
  const id = String(overId);
  if (id === "timeline-drop") {
    return localItemIds.length;
  }
  const index = localItemIds.indexOf(id);
  return index >= 0 ? index : undefined;
}

const inventoryTimelineCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }
  return closestCenter(args);
};

export function RoutineBuilder({ routine: initialRoutine }: RoutineBuilderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [routine, setRoutine] = useState(initialRoutine);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [addType, setAddType] = useState<RoutineItemType | null>(null);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [dropInsertIndex, setDropInsertIndex] = useState<number | null>(null);
  const [hiddenInventoryDragId, setHiddenInventoryDragId] = useState<string | null>(null);

  const [scrollToItemId, setScrollToItemId] = useState<string | null>(null);

  const { localItemIds, setLocalItemIds } = useTimelineOrder(routine.timeline);

  const inventoryMode =
    addType !== null ? "add" : selectedItemId ? "edit" : "idle";

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

  const addTimelineItem = async (
    type: RoutineItemType,
    payload: EditingPanelSubmitPayload,
    insertIndex?: number,
  ) => {
    const { data } = await addItem({
      variables: {
        routineId: routine.id,
        input: { type, ...payload },
        insertIndex,
      },
    });
    const updated = data?.addRoutineItem as Routine | undefined;
    if (updated) {
      applyRoutineUpdate(updated);
      const sorted = [...updated.timeline].sort((a, b) => a.order - b.order);
      const newItem =
        insertIndex != null
          ? sorted[insertIndex]
          : sorted[sorted.length - 1];
      if (newItem?.id) {
        setScrollToItemId(newItem.id);
      }
      if (PERSIST_ADD_TYPES.has(type)) {
        setAddType(type);
        setSelectedItemId(null);
      } else {
        setAddType(null);
        setSelectedItemId(newItem?.id ?? null);
      }
    }
  };

  const handleAddBodyElement = async (bodyElementId: string, insertIndex?: number) => {
    await addTimelineItem("body_element", { bodyElementId }, insertIndex);
  };

  const handleAddArtistry = async (artistryComponentId: string, insertIndex?: number) => {
    await addTimelineItem("artistry", { artistryComponentId }, insertIndex);
  };

  const handleAddSubmit = async (payload: EditingPanelSubmitPayload) => {
    if (!addType) {
      return;
    }
    await addTimelineItem(addType, payload);
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
    setLocalItemIds(ids);
    await handleReorder(ids);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (id.startsWith("inventory-body-") || id.startsWith("inventory-artistry-")) {
      setHiddenInventoryDragId(id);
    }
    const data = event.active.data.current as
      | { label?: string; subtitle?: string; color?: string }
      | undefined;

    if (data?.label) {
      setDragPreview({
        label: data.label,
        subtitle: data.subtitle,
        color: data.color,
      });
      return;
    }

    const timelineItem = routine.timeline.find((item) => item.id === id);
    if (timelineItem) {
      setDragPreview({
        label: getRoutineItemLabel(timelineItem),
        subtitle: getRoutineItemTypeLabel(timelineItem.type),
        color: TIMELINE_TYPE_COLORS[timelineItem.type],
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setDropInsertIndex(null);
      return;
    }

    const activeId = String(active.id);
    const isInventoryDrag =
      activeId.startsWith("inventory-body-") || activeId.startsWith("inventory-artistry-");

    if (isInventoryDrag || localItemIds.includes(activeId)) {
      const index = getTimelineInsertIndex(over.id, localItemIds);
      setDropInsertIndex(index ?? null);
      return;
    }

    setDropInsertIndex(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const isInventoryDrag =
      activeId.startsWith("inventory-body-") || activeId.startsWith("inventory-artistry-");

    if (!isInventoryDrag) {
      setDragPreview(null);
      setHiddenInventoryDragId(null);
    }
    setDropInsertIndex(null);

    const isTimelineDropTarget = (overId: unknown) => {
      if (overId == null) {
        return false;
      }
      const id = String(overId);
      return id === "timeline-drop" || localItemIds.includes(id);
    };

    const insertIndex = getTimelineInsertIndex(over?.id, localItemIds);

    if (String(active.id).startsWith("inventory-body-")) {
      const bodyElementId = active.data.current?.bodyElementId as string | undefined;
      if (bodyElementId && isTimelineDropTarget(over?.id)) {
        if (addType !== "body_element") {
          setAddType("body_element");
          setSelectedItemId(null);
        }
        try {
          await handleAddBodyElement(bodyElementId, insertIndex);
        } finally {
          setDragPreview(null);
          setHiddenInventoryDragId(null);
        }
      } else {
        setDragPreview(null);
        setHiddenInventoryDragId(null);
      }
      return;
    }

    if (String(active.id).startsWith("inventory-artistry-")) {
      const artistryComponentId = active.data.current?.artistryComponentId as string | undefined;
      if (artistryComponentId && isTimelineDropTarget(over?.id)) {
        if (addType !== "artistry") {
          setAddType("artistry");
          setSelectedItemId(null);
        }
        try {
          await handleAddArtistry(artistryComponentId, insertIndex);
        } finally {
          setDragPreview(null);
          setHiddenInventoryDragId(null);
        }
      } else {
        setDragPreview(null);
        setHiddenInventoryDragId(null);
      }
      return;
    }

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localItemIds.indexOf(String(active.id));
    const newIndex = localItemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(localItemIds, oldIndex, newIndex);
    setLocalItemIds(reordered);
    await handleReorder(reordered);
  };

  const handleDragCancel = () => {
    setDragPreview(null);
    setDropInsertIndex(null);
    setHiddenInventoryDragId(null);
  };

  const inventorySection = (
    <InventoryPanel
      apparatus={routine.apparatus}
      mode={inventoryMode}
      itemType={addType}
      selectedItem={selectedItem}
      onStartAdd={(type) => {
        setSelectedItemId(null);
        setAddType(type);
      }}
      onBack={() => {
        setAddType(null);
        setSelectedItemId(null);
      }}
      onSubmit={inventoryMode === "add" ? handleAddSubmit : handleEditSubmit}
      onAddBodyElement={handleAddBodyElement}
      onAddArtistry={handleAddArtistry}
      busy={busy}
      hiddenInventoryDragId={hiddenInventoryDragId}
    />
  );

  const timelineSection = (
    <TimelinePanel
      routine={routine}
      selectedItemId={selectedItemId}
      onSelectItem={(id) => {
        setAddType(null);
        setSelectedItemId(id);
      }}
      onRemoveItem={setRemoveItemId}
      onMoveItem={handleMoveItem}
      localItemIds={localItemIds}
      dropInsertIndex={dropInsertIndex}
      dropIndicatorColor={dragPreview?.color ?? null}
      busy={busy}
      scrollToItemId={scrollToItemId}
      onScrolledToItem={() => setScrollToItemId(null)}
    />
  );

  const scoreSection = <ScorePanel routine={routine} />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "auto", md: "calc(100vh - 180px)" },
        minHeight: { md: 520 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="h4" color="secondary.main">
          {routine.gymnastName}
        </Typography>
        <Chip
          size="small"
          label={
            busy
              ? "Saving…"
              : `Saved · ${new Date(routine.updatedAt).toLocaleTimeString()}`
          }
          color={busy ? "default" : "success"}
          variant="outlined"
        />
      </Box>
      <Typography color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
        {formatApparatus(routine.apparatus)} · {formatAgeCategory(routine.ageCategory)}
        {" · "}
        Changes save automatically
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={inventoryTimelineCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Grid
          container
          spacing={2}
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: { xs: "visible", md: "hidden" },
          }}
        >
          {isMobile ? (
            <>
              <Grid size={12} sx={{ flexShrink: 0 }}>
                {scoreSection}
              </Grid>
              <Grid size={12} sx={{ display: "flex", minHeight: 220, maxHeight: 320 }}>
                {timelineSection}
              </Grid>
              <Grid size={12} sx={{ display: "flex", minHeight: 280, flex: 1 }}>
                {inventorySection}
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", minHeight: 0, height: "100%" }}>
                {inventorySection}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", minHeight: 0, height: "100%" }}>
                {timelineSection}
              </Grid>
              <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", minHeight: 0, height: "100%" }}>
                {scoreSection}
              </Grid>
            </>
          )}
        </Grid>

        <DragOverlay dropAnimation={null}>
          {dragPreview ? (
            <Paper
              elevation={6}
              sx={{
                px: 1.5,
                py: 1,
                display: "flex",
                alignItems: "flex-start",
                borderRadius: 1,
                maxWidth: 360,
                borderLeft: "4px solid",
                borderLeftColor: dragPreview.color ?? "primary.main",
                cursor: "grabbing",
              }}
            >
              <DragIndicatorIcon
                fontSize="small"
                sx={{ mr: 1, mt: 0.25, color: "text.secondary" }}
              />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: dragPreview.color ?? "text.primary" }}
                >
                  {dragPreview.label}
                </Typography>
                {dragPreview.subtitle ? (
                  <Typography variant="caption" color="text.secondary">
                    {dragPreview.subtitle}
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>

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
