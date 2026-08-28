import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, IconButton, TextField, type TextFieldProps } from "@mui/material";
import { touchIconButtonSx } from "../../theme/touchTargets";

interface NumberStepperFieldProps extends Omit<TextFieldProps, "type" | "onChange" | "value"> {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function NumberStepperField({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  sx,
  slotProps,
  ...textFieldProps
}: NumberStepperFieldProps) {
  const clamp = (next: number) => {
    let result = Math.max(min, next);
    if (max != null) {
      result = Math.min(max, result);
    }
    return result;
  };

  const step = (delta: number) => {
    onChange(clamp(value + delta));
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, ...sx }}>
      <IconButton
        aria-label="Decrease"
        size="small"
        disabled={disabled || value <= min}
        onClick={() => step(-1)}
        sx={touchIconButtonSx}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <TextField
        {...textFieldProps}
        type="number"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(next) ? min : clamp(next));
        }}
        slotProps={{
          ...slotProps,
          htmlInput: {
            min,
            max,
            step: 1,
            ...slotProps?.htmlInput,
          },
        }}
        sx={{
          width: 72,
          flexShrink: 0,
          "& .MuiInputBase-input": {
            fontSize: { xs: "16px", sm: "inherit" },
            textAlign: "center",
          },
        }}
      />
      <IconButton
        aria-label="Increase"
        size="small"
        disabled={disabled || (max != null && value >= max)}
        onClick={() => step(1)}
        sx={touchIconButtonSx}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
