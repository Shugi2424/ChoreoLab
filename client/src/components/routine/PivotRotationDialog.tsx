import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  calculatePivotValue,
  formatPivotRotationHint,
  getPivotRotationRule,
  validatePivotTurnCount,
} from "../../utils/pivotRotation";

interface PivotElement {
  id: string;
  name: string;
  value: number;
}

interface PivotRotationDialogProps {
  open: boolean;
  element: PivotElement | null;
  onCancel: () => void;
  onConfirm: (rotationCount: number) => void;
  busy?: boolean;
}

export function PivotRotationDialog({
  open,
  element,
  onCancel,
  onConfirm,
  busy = false,
}: PivotRotationDialogProps) {
  const [rotationCount, setRotationCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRotationCount(1);
      setError(null);
    }
  }, [open, element?.id]);

  const rule = useMemo(() => {
    if (!element) {
      return null;
    }
    return getPivotRotationRule(element.id, element.value);
  }, [element]);

  const valuePreview = useMemo(() => {
    if (!element || !rule) {
      return null;
    }
    return calculatePivotValue(element.value, rule, rotationCount);
  }, [element, rotationCount, rule]);

  const handleConfirm = () => {
    if (!element || !rule) {
      return;
    }
    const turnError = validatePivotTurnCount(rule, rotationCount);
    if (turnError) {
      setError(turnError);
      return;
    }
    setError(null);
    onConfirm(rotationCount);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Configure pivot rotations</DialogTitle>
      <DialogContent>
        {element && rule ? (
          <>
            <Typography variant="body2" sx={{ mb: 2, whiteSpace: "normal", wordBreak: "break-word" }}>
              {element.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              CoP §12: {rule.turnLabel}
              {rule.incrementPerTurn != null
                ? ` (+${rule.incrementPerTurn.toFixed(1)} per additional turn)`
                : " (fixed value)"}
            </Typography>
            <TextField
              label={rule.turnLabel}
              type="number"
              size="small"
              fullWidth
              value={rotationCount}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10);
                setRotationCount(Number.isNaN(next) ? 1 : Math.max(1, next));
                setError(null);
              }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  step: 1,
                },
              }}
              disabled={busy || rule.incrementPerTurn == null}
              error={error != null}
              helperText={error}
              sx={{ mb: 1 }}
            />
            {valuePreview != null && (
              <Typography variant="body2" color="primary.main">
                {formatPivotRotationHint(element.value, rule, rotationCount)}
              </Typography>
            )}
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={busy || !element || !rule}>
          Add to timeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}
