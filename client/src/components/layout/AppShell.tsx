import { Outlet } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "My Routines", path: "/routines" },
  { label: "Profile", path: "/profile" },
];

export function AppShell() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar>
          <Typography
            component={RouterLink}
            to="/dashboard"
            variant="h6"
            sx={{
              flexGrow: 1,
              color: "inherit",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ChoreoLab
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              color="inherit"
              sx={{
                opacity: location.pathname.startsWith(item.path) ? 1 : 0.85,
                fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
