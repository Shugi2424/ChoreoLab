import { TextField, type TextFieldProps } from "@mui/material";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { createElement, type HTMLAttributes, type Key, type ReactNode } from "react";

/** Compact but readable styling for inventory pickers (rotations, bases, criteria). */
export const compactPickerSx = {
  "& .MuiInputBase-root": {
    fontSize: "0.8125rem",
    alignItems: "center",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.8125rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.8125rem",
  },
  "& .MuiFormHelperText-root": { fontSize: "0.75rem" },
  "& .MuiChip-root": {
    height: 24,
    maxWidth: "100%",
  },
  "& .MuiChip-label": {
    fontSize: "0.75rem",
    px: 0.75,
    lineHeight: 1.3,
    whiteSpace: "normal",
  },
  "& .MuiAutocomplete-tag": { maxWidth: "calc(100% - 6px)" },
};

export const compactListboxSlotProps = {
  listbox: {
    sx: {
      "& .MuiAutocomplete-option": {
        fontSize: "0.75rem",
        py: 0.75,
        px: 1.5,
        lineHeight: 1.35,
        whiteSpace: "normal",
        minHeight: "auto",
      },
    },
  },
};

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
        fontSize: "0.75rem",
        lineHeight: 1.35,
        whiteSpace: "normal",
      },
    },
    label,
  );
}
