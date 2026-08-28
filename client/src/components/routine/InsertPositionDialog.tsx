import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

export interface InsertPositionOption {
  label: string;
  insertIndex: number;
}

interface InsertPositionDialogProps {
  open: boolean;
  itemName: string;
  options: InsertPositionOption[];
  onClose: () => void;
  onSelect: (insertIndex: number) => void;
  busy?: boolean;
}

export function InsertPositionDialog({
  open,
  itemName,
  options,
  onClose,
  onSelect,
  busy = false,
}: InsertPositionDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Choose timeline position</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Insert <strong>{itemName}</strong> at:
        </Typography>
        <List dense disablePadding>
          {options.map((option) => (
            <ListItemButton
              key={option.insertIndex}
              disabled={busy}
              onClick={() => onSelect(option.insertIndex)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText primary={option.label} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
