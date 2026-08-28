import { alpha, createTheme } from "@mui/material/styles";

const brand = {
  50: "#FAF7FF",
  100: "#F3EEFF",
  200: "#E9E0FF",
  300: "#D8C9FF",
  400: "#C4B5FD",
  500: "#A78BFA",
  600: "#8B7CF6",
  700: "#7C6AEF",
  800: "#6D5BD7",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand[600],
      light: brand[400],
      dark: brand[700],
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: brand[500],
      light: brand[300],
      dark: brand[800],
      contrastText: "#FFFFFF",
    },
    background: {
      default: brand[50],
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2A2540",
      secondary: "#6B6580",
    },
    divider: alpha("#6D5BD7", 0.12),
    success: { main: "#16A34A" },
    error: { main: "#DC2626" },
    warning: { main: "#D97706" },
    info: { main: "#0EA5E9" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      fontSize: "1.75rem",
      color: "#2A2540",
      letterSpacing: "-0.03em",
    },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, letterSpacing: "-0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: brand[50],
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[600]} 55%, ${brand[700]} 100%)`,
          borderBottom: `1px solid ${alpha("#FFFFFF", 0.16)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          boxShadow: "none",
          minHeight: 40,
          "&:hover": { boxShadow: "none" },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: brand[400],
            outlineOffset: 2,
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: brand[700],
          },
        },
        outlined: {
          borderColor: alpha(brand[600], 0.35),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${alpha("#6D5BD7", 0.1)}`,
          boxShadow: "0 8px 24px rgba(109, 91, 215, 0.06)",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha("#6D5BD7", 0.1)}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          minHeight: 48,
          color: "#6B6580",
          "&.Mui-selected": {
            color: brand[700],
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: brand[600],
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: brand[400],
            outlineOffset: 2,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: alpha(brand[600], 0.1),
            "&:hover": {
              backgroundColor: alpha(brand[600], 0.14),
            },
          },
          "&:hover": {
            backgroundColor: alpha(brand[600], 0.06),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
        },
        outlined: {
          borderColor: alpha("#6D5BD7", 0.2),
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            fontSize: "1rem",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: brand[500],
            borderWidth: 2,
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: brand[400],
            outlineOffset: 2,
            borderRadius: 4,
          },
        },
      },
    },
  },
});
