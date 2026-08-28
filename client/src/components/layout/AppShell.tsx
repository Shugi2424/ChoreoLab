import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Logo } from "../brand/Logo";

const navItems = [
  { label: "Home", path: "/dashboard" },
  { label: "My Routines", path: "/routines" },
  { label: "Profile", path: "/profile" },
];

export function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { coach, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const navButtonSx = (path: string) => ({
    opacity: isActive(path) ? 1 : 0.86,
    fontWeight: isActive(path) ? 700 : 600,
    borderBottom: isActive(path) ? "2px solid #fff" : "2px solid transparent",
    borderRadius: 0,
    px: 1.5,
    minHeight: 48,
  });

  const drawer = (
    <Box sx={{ width: 280, pt: 1.5 }} role="navigation" aria-label="Main">
      <Box sx={{ px: 2, pb: 2 }}>
        <Logo variant="dark" size="sm" />
      </Box>
      {coach ? (
        <Typography sx={{ px: 2, pb: 1.5, color: "text.secondary" }} variant="body2">
          {coach.firstName} {coach.lastName}
        </Typography>
      ) : null}
      <List dense sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={isActive(item.path)}
            onClick={() => setDrawerOpen(false)}
            sx={{ mb: 0.5 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton onClick={() => void logout()} sx={{ mt: 1 }}>
          <ListItemText primary="Log out" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="secondary">
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 64 } }}>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Box
            component={RouterLink}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              color: "inherit",
              textDecoration: "none",
              display: "inline-flex",
            }}
          >
            <Logo variant="light" size={isMobile ? "sm" : "md"} />
          </Box>
          {!isMobile && coach ? (
            <Typography sx={{ mr: 2, opacity: 0.92, fontSize: "0.875rem", fontWeight: 600 }}>
              {coach.firstName} {coach.lastName}
            </Typography>
          ) : null}
          {!isMobile
            ? navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={navButtonSx(item.path)}
                >
                  {item.label}
                </Button>
              ))
            : null}
          {!isMobile ? (
            <Button color="inherit" onClick={() => void logout()} sx={{ ml: 1, fontWeight: 600 }}>
              Log out
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
