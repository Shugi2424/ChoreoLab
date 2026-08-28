import type { SxProps, Theme } from "@mui/material";

/** WCAG / M9 minimum touch target size (px). */
export const TOUCH_TARGET_PX = 44;

export const touchIconButtonSx: SxProps<Theme> = {
  width: TOUCH_TARGET_PX,
  height: TOUCH_TARGET_PX,
};

export const touchDragHandleSx: SxProps<Theme> = {
  ...touchIconButtonSx,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
