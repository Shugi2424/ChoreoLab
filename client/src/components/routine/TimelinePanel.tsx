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
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Routine, RoutineItem } from "../../types/routine";
import {
  getRoutineItemTimelineMeta,
  getRoutineItemTimelinePrimary,
  TIMELINE_TYPE_COLORS,
} from "../../types/routine";
import { applyTimelineScroll } from "../../utils/timelineScroll";
import { touchIconButtonSx } from "../../theme/touchTargets";

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
  scrollToItemId?: string | null;
  scrollToEnd?: boolean;
  onScrolledToItem?: () => void;
  touchFriendly?: boolean;
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
  touchFriendly?: boolean;
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
  const wrapsPrimary = item.type === "body_element" || item.type === "artistry";

  return (
    <ListItemText
      primary={`${index + 1}. ${getRoutineItemTimelinePrimary(item)}`}
      secondary={getRoutineItemTimelineMeta(item)}
      slotProps={{
        primary: {
          variant: "body2",
          sx: {
            fontWeight: selected ? 600 : 400,
            color: accent,
            ...(wrapsPrimary
              ? { whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }
              : { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }),
          },
        },
        secondary: {
          variant: "caption",
          sx: { color: accent, opacity: 0.85, mt: 0.25 },
        },
      }}
      sx={{ minWidth: 0, mr: 1 }}
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
  touchFriendly = false,
}: SortableTimelineRowProps) {
  const sortableDisabled = disabled || touchFriendly;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: sortableDisabled });

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
      {!touchFriendly ? (
        <Box
          component="span"
          aria-label="Drag to reorder"
          sx={{
            cursor: disabled ? "default" : "grab",
            mr: 0.5,
            mt: 0.25,
            color: "text.secondary",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
          }}
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      ) : null}
      <TimelineRowContent item={item} index={index} selected={selected} />
      <ButtonGroup
        size={touchFriendly ? "medium" : "small"}
        orientation="vertical"
        sx={{ mr: 0.5, flexShrink: 0 }}
      >
        <IconButton
          aria-label="Move up"
          disabled={disabled || !canMoveUp}
          sx={touchFriendly ? touchIconButtonSx : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
        >
          <KeyboardArrowUpIcon fontSize={touchFriendly ? "medium" : "small"} />
        </IconButton>
        <IconButton
          aria-label="Move down"
          disabled={disabled || !canMoveDown}
          sx={touchFriendly ? touchIconButtonSx : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
        >
          <KeyboardArrowDownIcon fontSize={touchFriendly ? "medium" : "small"} />
        </IconButton>
      </ButtonGroup>
      <IconButton
        aria-label="Remove item"
        color="error"
        disabled={disabled}
        sx={touchFriendly ? touchIconButtonSx : undefined}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <DeleteOutlinedIcon fontSize={touchFriendly ? "medium" : "small"} />
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
  scrollToItemId,
  scrollToEnd = false,
  onScrolledToItem,
  touchFriendly = false,
}: TimelinePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (!scrollToItemId && !scrollToEnd) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const performScroll = () => {
      applyTimelineScroll(container, {
        scrollToEnd,
        scrollToItemId: scrollToItemId ?? null,
        sortedItemIds: sortedItems.map((item) => item.id),
      });
      onScrolledToItem?.();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(performScroll);
    });
  }, [scrollToItemId, scrollToEnd, sortedItems, onScrolledToItem]);

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 2,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        outline: isOver ? "2px dashed" : "2px dashed transparent",
        outlineColor: isOver ? "primary.main" : "transparent",
        transition: "outline-color 0.15s ease",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
        Timeline
      </Typography>
      {touchFriendly ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, flexShrink: 0 }}>
          Use the arrow buttons to reorder items.
        </Typography>
      ) : null}

      <Box ref={scrollContainerRef} sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
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
                <Box key={item.id} data-timeline-item-id={item.id}>
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
                    touchFriendly={touchFriendly}
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
  const [prevServerItemIds, setPrevServerItemIds] = useState(serverItemIds);

  if (serverItemIds !== prevServerItemIds) {
    setPrevServerItemIds(serverItemIds);
    setLocalItemIds(serverItemIds);
  }

  return { localItemIds, setLocalItemIds, sortedItems };
}
