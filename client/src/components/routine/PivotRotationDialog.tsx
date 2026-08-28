import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { NumberStepperField } from "../ui/NumberStepperField";
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

interface PivotRotationDialogFormProps {
  element: PivotElement;
  onCancel: () => void;
  onConfirm: (rotationCount: number) => void;
  busy: boolean;
}

function PivotRotationDialogForm({
  element,
  onCancel,
  onConfirm,
  busy,
}: PivotRotationDialogFormProps) {
  const [rotationCount, setRotationCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const rule = useMemo(() => getPivotRotationRule(element.id, element.value), [element]);

  const valuePreview = useMemo(() => {
    if (!rule) {
      return null;
    }
    return calculatePivotValue(element.value, rule, rotationCount);
  }, [element.value, rotationCount, rule]);

  const handleConfirm = () => {
    if (!rule) {
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
    <>
      <DialogTitle>Configure pivot rotations</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, whiteSpace: "normal", wordBreak: "break-word" }}>
          {element.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          CoP §12: {rule.turnLabel}
          {rule.incrementPerTurn != null
            ? ` (+${rule.incrementPerTurn.toFixed(1)} per additional turn)`
            : " (fixed value)"}
        </Typography>
        <NumberStepperField
          label={rule.turnLabel}
          size="small"
          fullWidth
          value={rotationCount}
          onChange={(next) => {
            setRotationCount(next);
            setError(null);
          }}
          disabled={busy || rule.incrementPerTurn == null}
          error={error != null}
          helperText={error ?? undefined}
          sx={{ mb: 1, maxWidth: 280 }}
        />
        {valuePreview != null && (
          <Typography variant="body2" color="primary.main">
            {formatPivotRotationHint(element.value, rule, rotationCount)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={busy}>
          Add to timeline
        </Button>
      </DialogActions>
    </>
  );
}

export function PivotRotationDialog({
  open,
  element,
  onCancel,
  onConfirm,
  busy = false,
}: PivotRotationDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="sm" fullWidth>
      {open && element ? (
        <PivotRotationDialogForm
          key={element.id}
          element={element}
          onCancel={onCancel}
          onConfirm={onConfirm}
          busy={busy}
        />
      ) : null}
    </Dialog>
  );
}
