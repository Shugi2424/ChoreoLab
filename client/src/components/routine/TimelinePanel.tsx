import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  ButtonGroup,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import type { Routine, RoutineItem } from "../../types/routine";
import {
  getRoutineItemLabel,
  getRoutineItemTypeLabel,
  TIMELINE_TYPE_COLORS,
} from "../../types/routine";

interface TimelinePanelProps {
  routine: Routine;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: "up" | "down") => void;
  localItemIds: string[];
  dropInsertIndex: number | null;
  dropIndicatorColor?: string | null;
  busy: boolean;
}

function DropSlotIndicator({ color }: { color?: string | null }) {
  const lineColor = color ?? "#1976D2";
  return (
    <Box
      sx={{
        height: 4,
        borderRadius: 1,
        bgcolor: lineColor,
        opacity: 0.9,
        my: 0.5,
        mx: 0.5,
        boxShadow: `0 0 0 2px ${lineColor}33`,
      }}
    />
  );
}

interface SortableTimelineRowProps {
  item: RoutineItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
}

function TimelineRowContent({
  item,
  index,
  selected,
}: {
  item: RoutineItem;
  index: number;
  selected: boolean;
}) {
  const accent = TIMELINE_TYPE_COLORS[item.type];
  return (
    <ListItemText
      primary={`${index + 1}. ${getRoutineItemLabel(item)}`}
      secondary={getRoutineItemTypeLabel(item.type)}
      slotProps={{
        primary: {
          variant: "body2",
          sx: { fontWeight: selected ? 600 : 400, color: accent },
        },
        secondary: {
          variant: "caption",
          sx: { color: accent, opacity: 0.75 },
        },
      }}
    />
  );
}

function SortableTimelineRow({
  item,
  index,
  selected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled,
}: SortableTimelineRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <ListItemButton
      ref={setNodeRef}
      style={style}
      selected={selected}
      onClick={onSelect}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        alignItems: "flex-start",
        pr: 1,
        borderLeft: "4px solid",
        borderLeftColor: TIMELINE_TYPE_COLORS[item.type],
      }}
    >
      <IconButton
        size="small"
        aria-label="Drag to reorder"
        sx={{ cursor: disabled ? "default" : "grab", mr: 0.5, mt: 0.25 }}
        disabled={disabled}
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <TimelineRowContent item={item} index={index} selected={selected} />
      <ButtonGroup size="small" orientation="vertical" sx={{ mr: 0.5 }}>
        <IconButton
          size="small"
          aria-label="Move up"
          disabled={disabled || !canMoveUp}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Move down"
          disabled={disabled || !canMoveDown}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      </ButtonGroup>
      <IconButton
        size="small"
        aria-label="Remove item"
        color="error"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <DeleteOutlinedIcon fontSize="small" />
      </IconButton>
    </ListItemButton>
  );
}

export function TimelinePanel({
  routine,
  selectedItemId,
  onSelectItem,
  onRemoveItem,
  onMoveItem,
  localItemIds,
  dropInsertIndex,
  dropIndicatorColor,
  busy,
}: TimelinePanelProps) {
  const sortedItems = useMemo(
    () => [...routine.timeline].sort((a, b) => a.order - b.order),
    [routine.timeline],
  );

  const displayItems = useMemo(() => {
    const byId = new Map(sortedItems.map((item) => [item.id, item]));
    return localItemIds
      .map((id) => byId.get(id))
      .filter((item): item is RoutineItem => item !== undefined);
  }, [localItemIds, sortedItems]);

  const { setNodeRef, isOver } = useDroppable({ id: "timeline-drop" });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        outline: isOver ? "2px dashed" : "2px dashed transparent",
        outlineColor: isOver ? "primary.main" : "transparent",
        transition: "outline-color 0.15s ease",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Timeline
      </Typography>

      <Box sx={{ flex: 1, minHeight: 120, overflow: "auto" }}>
        {displayItems.length === 0 ? (
          <Box sx={{ py: 2 }}>
            {dropInsertIndex === 0 ? <DropSlotIndicator color={dropIndicatorColor} /> : null}
            <Typography color="text.secondary" variant="body2">
              Drag body elements or artistry here, or use Add from the inventory panel.
            </Typography>
          </Box>
        ) : (
          <SortableContext items={localItemIds} strategy={verticalListSortingStrategy}>
            <List dense disablePadding>
              {displayItems.map((item, index) => (
                <Box key={item.id}>
                  {dropInsertIndex === index ? (
                    <DropSlotIndicator color={dropIndicatorColor} />
                  ) : null}
                  <SortableTimelineRow
                    item={item}
                    index={index}
                    selected={selectedItemId === item.id}
                    onSelect={() => onSelectItem(item.id)}
                    onRemove={() => onRemoveItem(item.id)}
                    onMoveUp={() => onMoveItem(item.id, "up")}
                    onMoveDown={() => onMoveItem(item.id, "down")}
                    canMoveUp={index > 0}
                    canMoveDown={index < displayItems.length - 1}
                    disabled={busy}
                  />
                </Box>
              ))}
              {dropInsertIndex === displayItems.length ? (
                <DropSlotIndicator color={dropIndicatorColor} />
              ) : null}
            </List>
          </SortableContext>
        )}
      </Box>
    </Paper>
  );
}

export function useTimelineOrder(timeline: Routine["timeline"]) {
  const sortedItems = useMemo(
    () => [...timeline].sort((a, b) => a.order - b.order),
    [timeline],
  );
  const serverItemIds = useMemo(() => sortedItems.map((item) => item.id), [sortedItems]);
  const [localItemIds, setLocalItemIds] = useState(serverItemIds);

  useEffect(() => {
    setLocalItemIds(serverItemIds);
  }, [serverItemIds]);

  return { localItemIds, setLocalItemIds, sortedItems };
}
