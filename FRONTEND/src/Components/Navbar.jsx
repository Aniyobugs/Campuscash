import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Notifications from "./Notifications";
import { Menu, Home, Sun, Moon, X, LogOut } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

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
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
      navigate("/", { state: { scrollTo: id } });
      setMobileOpen(false);
    }
  };

  const { role, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  const headerClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    isTransparent
      ? "bg-transparent text-foreground"
      : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm text-foreground"
  }`;

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-4 lg:max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="p-2 transition-colors hover:text-primary">
                <Home className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold tracking-wide text-primary" style={{ color: "var(--primary)" }}>
                Campus Cash
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {/* Common links */}
              {!role && menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.id)}
                  className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.label}
                </button>
              ))}

              {!role && (
                <Link to="/events" className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary">
                  Event
                </Link>
              )}

              {/* Role-specific links */}
              {role === "admin" && (
                <>
                  <Link to="/admin" className="px-3 py-2 text-sm font-medium hover:text-primary">Admin</Link>
                  <Link to="/tsk" className="px-3 py-2 text-sm font-medium hover:text-primary">Assign</Link>
                  <Link to="/admin/roles" className="px-3 py-2 text-sm font-medium hover:text-primary">Roles</Link>
                  <Link to="/events" className="px-3 py-2 text-sm font-medium hover:text-primary">Event</Link>
                </>
              )}

              {role === "store" && (
                <Link to="/store" className="px-3 py-2 text-sm font-medium hover:text-primary">Store</Link>
              )}

              {role === "faculty" && (
                <>
                  <Link to="/faculty" className="px-3 py-2 text-sm font-medium hover:text-primary">Faculty</Link>
                  <Link to="/events" className="px-3 py-2 text-sm font-medium hover:text-primary">Event</Link>
                </>
              )}

              {role === "user" && (
                <>
                  <Link to="/user" className="px-3 py-2 text-sm font-medium hover:text-primary">Dashboard</Link>
                  <Link to="/tasks" className="px-3 py-2 text-sm font-medium hover:text-primary">Tasks</Link>
                  <Link to="/events" className="px-3 py-2 text-sm font-medium hover:text-primary">Event</Link>
                  <Link to="/profile" className="px-3 py-2 text-sm font-medium hover:text-primary">Profile</Link>
                </>
              )}

              {role && <Notifications />}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-accent transition-colors text-primary ml-2"
                aria-label="Toggle Theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {!role ? (
                <div className="flex items-center gap-3">
                  <Link to="/L" className="px-4 py-2 text-sm font-medium hover:text-primary">
                    Login
                  </Link>
                  <Link to="/s" className="px-5 py-2 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors">
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-4 ml-2 pl-2 md:pl-4 border-l border-border shrink-0">
                  <span className="hidden xl:inline-block px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted rounded-md">
                    {role}
                  </span>
                  {user && (
                    <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors group">
                       <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                         {user.fname ? user.fname[0].toUpperCase() : 'U'}
                       </div>
                       <span className="hidden lg:inline-block text-sm font-bold truncate max-w-[120px]">
                         {user.fname || user.email}
                       </span>
                    </Link>
                  )}
                  <button onClick={logout} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors shrink-0" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </nav>

            <button className="md:hidden p-2" onClick={handleDrawerToggle}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-background flex flex-col pt-20 px-6 gap-4"
          >
            <Link to="/" onClick={handleDrawerToggle} className="text-lg font-medium py-2 border-b border-border">Home</Link>
            
            {!role && menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.id)}
                className="text-left py-2 text-lg font-medium border-b border-border"
              >
                {item.label}
              </button>
            ))}
            {!role && <Link to="/events" onClick={handleDrawerToggle} className="py-2 text-lg font-medium border-b border-border">Event</Link>}

            {/* Same role menus... */}
            {role === "admin" && (
                <>
                  <Link to="/admin" onClick={handleDrawerToggle} className="py-2 text-lg font-medium border-b border-border">Admin</Link>
                  <Link to="/tsk" onClick={handleDrawerToggle} className="py-2 text-lg font-medium border-b border-border">Assign</Link>
                  <Link to="/admin/roles" onClick={handleDrawerToggle} className="py-2 text-lg font-medium border-b border-border">Roles</Link>
                </>
            )}

            {!role ? (
              <div className="flex flex-col gap-3 mt-4">
                <Link to="/L" onClick={handleDrawerToggle} className="py-3 text-center border border-border rounded-lg font-medium">Login</Link>
                <Link to="/s" onClick={handleDrawerToggle} className="py-3 text-center bg-primary text-primary-foreground rounded-lg font-bold">Get Started</Link>
              </div>
            ) : (
                <button onClick={() => { logout(); handleDrawerToggle(); }} className="py-3 text-center bg-destructive text-destructive-foreground rounded-lg font-bold mt-4">Logout</button>
            )}

            {/* Mobile Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="flex items-center gap-2 py-3 mt-auto mb-8 border-t border-border w-full text-left"
              >
                  {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
                  <span className="font-medium text-lg">{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
