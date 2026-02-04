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
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Notifications from "./Notifications";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const { isDark, toggleTheme } = useTheme();

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

        {!role && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/events">
              <ListItemText primary="Event" />
            </ListItemButton>
          </ListItem>
        )}

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

        {role === "faculty" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/faculty">
              <ListItemText primary="Faculty" />
            </ListItemButton>
          </ListItem>
        )}

        {role === "user" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/events">
              <ListItemText primary="Event" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Profile / Auth Actions */}
        {role ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile">
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>

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
        ) : (
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
        )}

      </List>
    </Box>
  );

  // Dynamic check for Home page transparency
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <AppBar
        position={isHome ? "fixed" : "sticky"}
        elevation={isTransparent ? 0 : 4}
        sx={{
          background: isTransparent
            ? 'transparent'
            : (isDark ? "rgba(26, 26, 26, 0.95)" : "rgba(255, 255, 255, 0.95)"),
          color: isDark ? "#ffffff" : "#212121",
          borderBottom: isTransparent ? 'none' : `1px solid ${isDark ? "#333333" : "#e0e0e0"}`,
          transition: 'all 0.3s ease-in-out',
          backdropFilter: isTransparent ? 'none' : 'blur(10px)',
          width: '100%',
          top: 0,
          left: 0,
          zIndex: 1100, // Ensure it stays on top
        }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ width: "100%", px: 0 }}>
            {/* Home Button */}
            <Tooltip title="Home">
              <IconButton component={Link} to="/" sx={{ color: isDark ? '#ffffff' : '#212121', mr: 1 }}>
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
                color: isDark ? '#8866ff' : '#6444e6',
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
                    sx={{
                      mx: 1,
                      textTransform: "none",
                      color: isDark ? '#ffffff' : '#212121',
                      '&:hover': {
                        color: isDark ? '#8866ff' : '#6444e6',
                      }
                    }}
                    onClick={() => handleNav(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}

              {!role && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/events"
                  sx={{
                    mx: 1,
                    textTransform: "none",
                    color: isDark ? '#ffffff' : '#212121',
                    '&:hover': {
                      color: isDark ? '#8866ff' : '#6444e6',
                    }
                  }}
                >
                  Event
                </Button>
              )}

              {/* Role-specific links */}
              {role === "admin" && (
                <>
                  <Button color="inherit" component={Link} to="/admin" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Admin
                  </Button>
                  <Button color="inherit" component={Link} to="/tsk" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Assign
                  </Button>
                  <Button color="inherit" component={Link} to="/admin/roles" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Roles
                  </Button>
                  <Button color="inherit" component={Link} to="/events" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Event
                  </Button>
                </>
              )}

              {role === "store" && (
                <Button color="inherit" component={Link} to="/store" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                  Store
                </Button>
              )}

              {role === "faculty" && (
                <>
                  <Button color="inherit" component={Link} to="/faculty" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Faculty
                  </Button>
                  <Button color="inherit" component={Link} to="/events" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Event
                  </Button>
                </>
              )}

              {role === "user" && (
                <>
                  <Button color="inherit" component={Link} to="/user" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Dashboard
                  </Button>
                  <Button color="inherit" component={Link} to="/tasks" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Tasks
                  </Button>
                  <Button color="inherit" component={Link} to="/events" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Event
                  </Button>
                  {/* Coupons is part of dashboard now per design, but keeping a mental note if direct link needed. 
                      Design just shows "Coupons" in top nav, so adding it. */}
                  <Button color="inherit" component={Link} to="/user" state={{ scrollTo: 'coupons' }} sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Coupons
                  </Button>
                  <Button color="inherit" component={Link} to="/profile" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Profile
                  </Button>
                </>
              )}

              {/* Notifications */}
              {role && (
                <Notifications />
              )}

              {/* Theme Toggle Button */}
              <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
                <IconButton color="inherit" onClick={toggleTheme} sx={{
                  mx: 1,
                  color: isDark ? '#8866ff' : '#6444e6',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(136, 102, 255, 0.1)' : 'rgba(100, 68, 230, 0.1)',
                  }
                }}>
                  <AnimatePresence mode='wait' initial={false}>
                    <motion.div
                      style={{ display: 'inline-flex' }}
                      key={isDark ? 'dark' : 'light'}
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
                    </motion.div>
                  </AnimatePresence>
                </IconButton>
              </Tooltip>

              {/* Auth actions */}
              {!role ? (
                <>
                  <Button component={Link} to="/L" sx={{ color: isDark ? '#ffffff' : '#212121' }}>
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/s"
                    sx={{
                      ml: 2,
                      borderRadius: 20,
                      textTransform: "none",
                      fontWeight: "bold",
                      px: 3,
                      py: 1,
                      backgroundColor: isDark ? '#6444e6' : '#6444e6',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: isDark ? '#8866ff' : '#7d5ae6',
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <>
                  {/* Role badge */}
                  <Button disabled sx={{
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(33, 33, 33, 0.7)',
                    textTransform: 'none',
                    ml: 1
                  }}>
                    {role && role.toUpperCase()}
                  </Button>

                  <Button color="inherit" onClick={logout} sx={{
                    ml: 2,
                    color: isDark ? '#ffffff' : '#212121',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    }
                  }}>
                    Logout
                  </Button>
                  {user && (
                    <Button color="inherit" component={Link} to="/profile" sx={{
                      ml: 1,
                      color: isDark ? '#ffffff' : '#212121',
                    }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                        <Typography variant="body2" fontWeight="bold">{user.fname || user.ename || user.email}</Typography>
                        {(user.department || user.yearClassDept) && (
                          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                            {user.department || user.yearClassDept}
                          </Typography>
                        )}
                      </Box>
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
