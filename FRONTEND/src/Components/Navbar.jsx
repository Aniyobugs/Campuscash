// CustomAppBar.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: "How It Works", id: "how" },
    { label: "Rewards", id: "rewards" },
    { label: "Why Us", id: "why" },
    { label: "Testimonials", id: "testimonials" },
  ];
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNav = (id) => {
    if (!id) return;
    if (location.pathname === "/") {
      scrollToId(id);
      setMobileOpen(false);
    } else {
      // navigate to home and request a scroll via location.state
      navigate("/", { state: { scrollTo: id } });
      setMobileOpen(false);
    }
  };

  // use AuthContext for role/user and logout
  const { role, user, logout } = useAuth();

  useEffect(() => {
    // keep local UI in sync with sessionStorage as a fallback
    const onStorage = () => {
      // no-op, React will re-render when context updates
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        {role ? (
          <ListItem>
            <ListItemText primary={role.toUpperCase()} sx={{ fontWeight: 'bold' }} />
          </ListItem>
        ) : null}
        {!role &&
          menuItems.map((item) => (
            <ListItem disablePadding key={item.label}>
              <ListItemButton onClick={() => handleNav(item.id)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        {role === "admin" && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin">
                <ListItemText primary="Admin" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/tsk">
                <ListItemText primary="Assign" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/roles">
                <ListItemText primary="Roles" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {role === "store" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/store">
              <ListItemText primary="Store" />
            </ListItemButton>
          </ListItem>
        )}

        {role === "user" && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/user">
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile">
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {!role ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/L">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/s">
                <ListItemText primary="Get Started" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
            {user && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/profile">
                  <ListItemText primary={user.fname || user.ename || user.email} />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ background: "#6444e6" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ width: "100%", px: 0 }}>
            {/* Home Button */}
            <Tooltip title="Home">
              <IconButton component={Link} to="/" sx={{ color: 'white', mr: 1 }}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            {/* Brand Name */}
            <Typography
              variant="h5"
              sx={{
                flexGrow: 1,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              Campus Cash
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {/* Common links (show only to guests) */}
              {!role &&
                menuItems.map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    sx={{ mx: 1, textTransform: "none" }}
                    onClick={() => handleNav(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}

              {/* Role-specific links */}
              {role === "admin" && (
                <>
                  <Button color="inherit" component={Link} to="/admin">
                    Admin
                  </Button>
                  <Button color="inherit" component={Link} to="/tsk">
                    Assign
                  </Button>
                  <Button color="inherit" component={Link} to="/admin/roles">
                    Roles
                  </Button>
                </>
              )}

              {role === "store" && (
                <Button color="inherit" component={Link} to="/store">
                  Store
                </Button>
              )}

              {role === "user" && (
                <>
                  <Button color="inherit" component={Link} to="/user">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={Link} to="/profile">
                    Profile
                  </Button>
                </>
              )}

              {/* Auth actions */}
              {!role ? (
                <>
                  <Button component={Link} to="/L" sx={{ color: "white" }}>
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    component={Link}
                    to="/s"
                    sx={{
                      ml: 2,
                      borderRadius: 20,
                      textTransform: "none",
                      fontWeight: "bold",
                      px: 3,
                      py: 1,
                    }}
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  {/* Role badge */}
                  <Button disabled sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'none', ml: 1 }}>
                    {role && role.toUpperCase()}
                  </Button>

                  <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>
                    Logout
                  </Button>
                  {user && (
                    <Button color="inherit" component={Link} to="/profile" sx={{ ml: 1 }}>
                      {user.fname || user.ename || user.email}
                    </Button>
                  )}
                </>
              )}
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
