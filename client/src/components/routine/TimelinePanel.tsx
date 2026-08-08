import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Routine, RoutineItem, RoutineItemType } from "../../types/routine";
import {
  getRoutineItemLabel,
  getRoutineItemTypeLabel,
} from "../../types/routine";

interface TimelinePanelProps {
  routine: Routine;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onAddItem: (type: RoutineItemType) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: "up" | "down") => void;
  onReorder: (itemIds: string[]) => void;
  busy: boolean;
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      <ListItemText
        primary={`${index + 1}. ${getRoutineItemLabel(item)}`}
        secondary={getRoutineItemTypeLabel(item.type)}
        slotProps={{
          primary: {
            variant: "body2",
            sx: { fontWeight: selected ? 600 : 400 },
          },
        }}
      />
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
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onReorder,
  busy,
}: TimelinePanelProps) {
  const items = [...routine.timeline].sort((a, b) => a.order - b.order);
  const itemIds = items.map((item) => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const reordered = [...itemIds];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered);
  };

  const addButtons: { type: RoutineItemType; label: string }[] = [
    { type: "body_element", label: "Body Element" },
    { type: "risk", label: "Risk" },
    { type: "mastery", label: "Mastery" },
    { type: "artistry", label: "Artistry" },
  ];

  return (
    <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom>
        Timeline
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          No items yet. Add body elements, risks, masteries, or artistry components below.
        </Typography>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <List dense disablePadding sx={{ flex: 1, overflow: "auto", mb: 2 }}>
              {items.map((item, index) => (
                <SortableTimelineRow
                  key={item.id}
                  item={item}
                  index={index}
                  selected={selectedItemId === item.id}
                  onSelect={() => onSelectItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onMoveUp={() => onMoveItem(item.id, "up")}
                  onMoveDown={() => onMoveItem(item.id, "down")}
                  canMoveUp={index > 0}
                  canMoveDown={index < items.length - 1}
                  disabled={busy}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: "auto" }}>
        {addButtons.map(({ type, label }) => (
          <Button
            key={type}
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={() => onAddItem(type)}
          >
            + {label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}
