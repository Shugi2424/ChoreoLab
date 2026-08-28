import { Box, IconButton, TextField, Typography, type TextFieldProps } from "@mui/material";

interface NumberStepperFieldProps extends Omit<TextFieldProps, "type" | "onChange" | "value"> {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const STEP_BUTTON_SIZE = 40;

const stepButtonSx = {
  width: STEP_BUTTON_SIZE,
  height: STEP_BUTTON_SIZE,
  p: 0,
  flexShrink: 0,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  color: "text.primary",
  "&:hover": {
    borderColor: "text.primary",
    bgcolor: "action.hover",
  },
  "&.Mui-disabled": {
    borderColor: "action.disabledBackground",
    color: "action.disabled",
  },
};

function StepButtonGlyph({ symbol }: { symbol: string }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: "grid",
        placeItems: "center",
        width: STEP_BUTTON_SIZE,
        height: STEP_BUTTON_SIZE,
        fontSize: "1.5rem",
        fontWeight: 400,
        lineHeight: 1,
        fontFamily: "system-ui, sans-serif",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {symbol}
    </Box>
  );
}

const numberInputSx = {
  width: 80,
  flexShrink: 0,
  "& .MuiInputBase-root": {
    height: STEP_BUTTON_SIZE,
  },
  "& .MuiInputBase-input": {
    fontSize: { xs: "16px", sm: "inherit" },
    textAlign: "center",
    py: 0,
    MozAppearance: "textfield",
  },
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
};

export function NumberStepperField({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  sx,
  slotProps,
  label,
  helperText,
  error,
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ...sx }}>
      {label ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
      ) : null}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <IconButton
          aria-label="Decrease"
          disabled={disabled || value <= min}
          onClick={() => step(-1)}
          sx={stepButtonSx}
        >
          <StepButtonGlyph symbol="-" />
        </IconButton>
        <TextField
          {...textFieldProps}
          type="text"
          inputMode="numeric"
          size="small"
          value={value}
          disabled={disabled}
          error={error}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            const next = Number.parseInt(digits, 10);
            onChange(Number.isNaN(next) ? min : clamp(next));
          }}
          slotProps={{
            ...slotProps,
            htmlInput: {
              min,
              max,
              "aria-label": typeof label === "string" ? label : undefined,
              ...slotProps?.htmlInput,
            },
          }}
          sx={numberInputSx}
        />
        <IconButton
          aria-label="Increase"
          disabled={disabled || (max != null && value >= max)}
          onClick={() => step(1)}
          sx={stepButtonSx}
        >
          <StepButtonGlyph symbol="+" />
        </IconButton>
      </Box>
      {helperText ? (
        <Typography variant="caption" color={error ? "error" : "text.secondary"}>
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}
