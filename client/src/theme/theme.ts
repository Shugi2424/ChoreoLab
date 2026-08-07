import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#E91E8C" },
    secondary: { main: "#7B2D8E" },
    background: { default: "#FFFFFF", paper: "#FFF5FA" },
    success: { main: "#0F7B4A" },
    error: { main: "#B42318" },
    warning: { main: "#B54708" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
