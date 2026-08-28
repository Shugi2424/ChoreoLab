import { Chip, TextField, type TextFieldProps } from "@mui/material";
import type {
  AutocompleteRenderInputParams,
  AutocompleteRenderValueGetItemProps,
} from "@mui/material/Autocomplete";
import { createElement, type HTMLAttributes, type Key, type ReactNode } from "react";

/** Compact but readable styling for inventory pickers (rotations, bases, criteria). */
export const compactPickerSx = {
  width: "100%",
  "& .MuiFormControl-root": {
    width: "100%",
  },
  "& .MuiInputBase-root": {
    fontSize: { xs: "16px", md: "0.8125rem" },
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 0.5,
    py: 0.75,
    height: "auto",
    minHeight: 40,
  },
  "& .MuiInputBase-input": {
    fontSize: { xs: "16px", md: "0.8125rem" },
    minWidth: 48,
    flexGrow: 1,
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "16px", md: "0.8125rem" },
  },
  "& .MuiFormHelperText-root": { fontSize: "0.75rem" },
  "& .MuiChip-root": {
    height: "auto",
    maxWidth: "100%",
    m: 0,
  },
  "& .MuiChip-label": {
    fontSize: { xs: "0.875rem", md: "0.75rem" },
    px: 0.75,
    py: 0.25,
    lineHeight: 1.3,
    whiteSpace: "normal",
    wordBreak: "break-word",
    display: "block",
  },
  "& .MuiAutocomplete-tag": {
    maxWidth: "100%",
    m: 0,
  },
  "& .MuiAutocomplete-inputRoot": {
    flexWrap: "wrap",
    rowGap: 0.5,
  },
  /** Placeholder and typing area wrap below selected chips (multi-select). */
  "& .MuiAutocomplete-input": {
    flex: "1 1 100%",
    minWidth: "100% !important",
  },
};

export const compactListboxSlotProps = {
  paper: {
    sx: {
      maxWidth: "min(100vw - 32px, 480px)",
    },
  },
  listbox: {
    sx: {
      "& .MuiAutocomplete-option": {
        fontSize: { xs: "16px", md: "0.75rem" },
        py: 0.75,
        px: 1.5,
        lineHeight: 1.35,
        whiteSpace: "normal",
        wordBreak: "break-word",
        minHeight: "auto",
      },
    },
  },
};

export function renderCompactMultiValue<T>(
  value: T[],
  getItemProps: AutocompleteRenderValueGetItemProps<true>,
  getLabel: (option: T) => string,
) {
  return value.map((option, index) => {
    const { key, ...itemProps } = getItemProps({ index });
    return createElement(Chip, {
      ...itemProps,
      key,
      label: getLabel(option),
      size: "small",
      sx: {
        maxWidth: "100%",
        height: "auto",
        alignItems: "flex-start",
        "& .MuiChip-label": {
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: 1.3,
          py: 0.25,
        },
      },
    });
  });
}

export function renderCompactAutocompleteInput(
  params: AutocompleteRenderInputParams,
  extra?: TextFieldProps,
) {
  return createElement(TextField, {
    ...params,
    ...extra,
    fullWidth: true,
    size: "small",
    margin: "dense",
    sx: { ...compactPickerSx, ...extra?.sx },
  });
}

export function renderCompactOption(
  props: HTMLAttributes<HTMLLIElement> & { key?: Key },
  label: ReactNode,
) {
  const { key, style, ...rest } = props;
  return createElement(
    "li",
    {
      ...rest,
      key,
      style: {
        ...style,
        fontSize: "inherit",
        lineHeight: 1.35,
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
    },
    label,
  );
}
