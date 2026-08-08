import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import {
  compactListboxSlotProps,
  compactPickerSx,
  renderCompactAutocompleteInput,
  renderCompactOption,
} from "./compactPickerStyles";

export interface InventoryItem {
  id: string;
  name: string;
  subtitle?: string;
}

interface DraggableInventoryRowProps {
  item: InventoryItem;
  dragId: string;
  dragData: Record<string, string>;
  selected: boolean;
  onAdd: () => void;
  disabled: boolean;
  dragColor?: string;
  hiddenDragId?: string | null;
}

function DraggableInventoryRow({
  item,
  dragId,
  dragData,
  selected,
  onAdd,
  disabled,
  dragColor,
  hiddenDragId,
}: DraggableInventoryRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      ...dragData,
      label: item.name,
      subtitle: item.subtitle,
      color: dragColor,
    },
    disabled,
  });

  const visuallyHidden = isDragging || dragId === hiddenDragId;

  return (
    <ListItem
      ref={setNodeRef}
      disablePadding
      sx={{
        opacity: visuallyHidden ? 0 : 1,
        pointerEvents: visuallyHidden ? "none" : undefined,
        mb: 0.75,
        alignItems: "stretch",
        borderRadius: 1,
        bgcolor: selected ? "action.selected" : "transparent",
        border: "1px solid",
        borderColor: selected ? "primary.light" : "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          minWidth: 0,
          gap: 0.5,
          p: 0.75,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "flex-start",
            pt: 0.25,
            flexShrink: 0,
            cursor: disabled ? "default" : "grab",
            color: "text.secondary",
          }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onAdd}
          disabled={disabled}
          sx={{
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            border: "none",
            background: "none",
            p: 0,
            cursor: disabled ? "default" : "pointer",
            color: "inherit",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ lineHeight: 1.35, whiteSpace: "normal", wordBreak: "break-word" }}
          >
            {item.name}
          </Typography>
          {item.subtitle ? (
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ mt: 0.25, lineHeight: 1.3, whiteSpace: "normal", wordBreak: "break-word" }}
            >
              {item.subtitle}
            </Typography>
          ) : null}
        </Box>
        <Button
          size="small"
          variant="text"
          onClick={onAdd}
          disabled={disabled}
          sx={{ flexShrink: 0, alignSelf: "flex-start", minWidth: 40, px: 0.5, fontSize: "0.7rem" }}
        >
          Add
        </Button>
      </Box>
    </ListItem>
  );
}

interface DraggableItemInventoryProps {
  title: string;
  hint: string;
  searchPlaceholder: string;
  items: InventoryItem[];
  selectedItemId?: string | null;
  dragIdPrefix: string;
  dragDataType: string;
  dragDataIdKey: string;
  onAddItem: (id: string) => void;
  onBack?: () => void;
  busy: boolean;
  dragColor?: string;
  hiddenDragId?: string | null;
}

export function DraggableItemInventory({
  title,
  hint,
  searchPlaceholder,
  items,
  selectedItemId,
  dragIdPrefix,
  dragDataType,
  dragDataIdKey,
  onAddItem,
  onBack,
  busy,
  dragColor,
  hiddenDragId = null,
}: DraggableItemInventoryProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query),
    );
  }, [items, search]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75, flexShrink: 0 }}>
        {onBack ? (
          <IconButton aria-label="Back to inventory menu" size="small" onClick={onBack} disabled={busy}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        ) : null}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, flexShrink: 0, lineHeight: 1.35 }}>
        {hint}
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 1, flexShrink: 0, ...compactPickerSx }}
      />
      <List dense disablePadding sx={{ flex: 1, overflow: "auto", minHeight: 0, pr: 0.5 }}>
        {filtered.length === 0 ? (
          <Typography color="text.secondary" variant="caption" sx={{ py: 1 }}>
            No items match your search.
          </Typography>
        ) : (
          filtered.map((item) => (
            <DraggableInventoryRow
              key={item.id}
              item={item}
              dragId={`${dragIdPrefix}-${item.id}`}
              dragData={{ type: dragDataType, [dragDataIdKey]: item.id }}
              selected={selectedItemId === item.id}
              onAdd={() => onAddItem(item.id)}
              disabled={busy}
              dragColor={dragColor}
              hiddenDragId={hiddenDragId}
            />
          ))
        )}
      </List>
    </Box>
  );
}

export function formatRotationLabel(rotation: { name: string; group: string }): string {
  return `${rotation.name} (${rotation.group})`;
}

interface RotationPickerProps {
  label?: string;
  placeholder?: string;
  value: string;
  rotations: Array<{ id: string; name: string; group: string }>;
  onChange: (rotationId: string) => void;
  disabled: boolean;
}

export function RotationPicker({
  label,
  placeholder = "Search rotations…",
  value,
  rotations,
  onChange,
  disabled,
}: RotationPickerProps) {
  const selected = rotations.find((rotation) => rotation.id === value) ?? null;

  return (
    <Autocomplete
      size="small"
      options={rotations}
      getOptionLabel={formatRotationLabel}
      filterOptions={(options, state) => {
        const query = state.inputValue.trim().toLowerCase();
        if (!query) {
          return options;
        }
        return options.filter(
          (rotation) =>
            rotation.name.toLowerCase().includes(query) ||
            rotation.group.toLowerCase().includes(query) ||
            formatRotationLabel(rotation).toLowerCase().includes(query),
        );
      }}
      value={selected}
      onChange={(_event, option) => onChange(option?.id ?? "")}
      slotProps={compactListboxSlotProps}
      renderOption={(props, option) =>
        renderCompactOption(props, formatRotationLabel(option))
      }
      renderInput={(params) =>
        renderCompactAutocompleteInput(params, {
          label,
          placeholder: label ? undefined : placeholder,
        })
      }
      disabled={disabled}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
    />
  );
}
