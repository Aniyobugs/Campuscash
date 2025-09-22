// CustomAppBar.js
import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: "How It Works", path: "/how" },
    { label: "Rewards", path: "/rewards" },
    { label: "Why Us", path: "/why" },
    { label: "Testimonials", path: "/testimonials" },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.label} component={Link} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem button component={Link} to="/L">
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem button component={Link} to="/s">
          <ListItemText primary="Get Started" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ background: "#6444e6" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ width: "100%", px: 0 }}>
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
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  sx={{ mx: 1, textTransform: "none" }}
                  component={Link}
                  to={item.path}
                >
                  {item.label}
                </Button>
              ))}
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
