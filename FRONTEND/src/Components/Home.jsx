import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Card,
  Grid, Paper, Divider, Stack, Chip, Link, Avatar, Rating
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DiamondIcon from '@mui/icons-material/Diamond';
import RedeemIcon from '@mui/icons-material/Redeem';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import StoreIcon from '@mui/icons-material/Store';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';

const featureData = [
  {
    icon: <CheckCircleIcon sx={{ fontSize: 48 }} />,
    title: '1. Complete Tasks',
    text: 'Assignments, projects, and campus activities earn you points—effort counts everywhere.',
    color: '#6366f1', // Indigo
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    shadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)'
  },
  {
    icon: <DiamondIcon sx={{ fontSize: 48 }} />,
    title: '2. Earn Points',
    text: 'Track your progress and see your point balance grow in your personalized dashboard.',
    color: '#10b981', // Emerald
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    shadow: '0 10px 30px -10px rgba(16, 185, 129, 0.4)'
  },
  {
    icon: <RedeemIcon sx={{ fontSize: 48 }} />,
    title: '3. Redeem Rewards',
    text: 'Use your points for discounts at the bookstore, free coffee, library perks, or admin services!',
    color: '#f59e0b', // Amber
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    shadow: '0 10px 30px -10px rgba(245, 158, 11, 0.4)'
  },
];

const rewardsData = [
  {
    img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5d6d7d',
    icon: <StoreIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Campus Store Discount',
    desc: 'Get 10% off textbooks and supplies!',
    points: '500 Points',
  },
  {
    img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=8a7c7c',
    icon: <LocalCafeIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Free Coffee',
    desc: 'Grab a drink at the campus café.',
    points: '100 Points',
  },
  {
    img: 'https://images.unsplash.com/photo-1532634896-26909d0d3a7e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4b2b4e3a1b',
    icon: <ReceiptIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Transcript Fee Waiver',
    desc: 'Waive your admin transcript fee.',
    points: '200 Points',
  },
  {
    img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b2c2c',
    icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Library Extension',
    desc: 'Extra week for book returns.',
    points: '80 Points',
  },
];

const testimonials = [
  {
    name: 'Aisha R.',
    role: 'Computer Science Student',
    quote: 'Campus Cash made studying fun — I redeemed a textbook discount within a month!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3c8f6f6f6f6f6f6f6f6f',
  },
  {
    name: 'Rahul K.',
    role: 'Business Student',
    quote: 'Easy tasks, quick points. Coffee on me this week — thanks Campus Cash!',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4b8f6f6f6f6f6f6f6f6f',
  },
  {
    name: 'Lina M.',
    role: 'Engineering Student',
    quote: 'The dashboard is motivating and the rewards are actually useful for campus life.',
    avatar: 'https://images.unsplash.com/photo-1545996124-1e1a5b1d9de3?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=55f6f6f6f6f6f6f6f6f',
  },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};
const parallax = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: 'spring', damping: 20 } }
};

// --- Animated Text Component ---
const AnimatedText = ({ text, className, sx }) => {
  // Split text into words, then characters
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", ...sx }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.div
          key={index}
          style={{ marginRight: "0.25em", whiteSpace: "nowrap" }}
        >
          {Array.from(word).map((character, index) => (
            <motion.span
              style={{ display: "inline-block" }}
              variants={child}
              key={index}
            >
              {character}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { isDark } = useTheme();

  useEffect(() => {
    const id = location.state?.scrollTo;
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        // wait a tick in case layout isn't ready
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
      // clear navigation state so repeated visits don't auto-scroll
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        /* ignore */
      }
    }
  }, [location]);

  const bgColor = isDark ? '#0f172a' : '#f8fafc'; // Darker slate for premium dark mode
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const accentColor = '#6366f1';
  const yellowAccent = '#fbbf24';

  return (
    <Box sx={{ bgcolor: bgColor, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar is now rendered globally in App.jsx */}

      {/* HERO SECTION */}
      <Box className="animate-gradient-bg" sx={{
        py: { xs: 8, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #1e293b)'
          : 'linear-gradient(-45deg, #f8fafc, #eef2ff, #fae8ff, #f0f9ff)',
      }}>
        {/* Animated floating shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ opacity: 0.3, scale: 1, y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 120,
            height: 120,
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '50%',
            zIndex: 1,
            filter: 'blur(40px)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ opacity: 0.2, scale: 1, y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 180,
            height: 180,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            zIndex: 1,
            filter: 'blur(50px)'
          }}
        />

        {/* Subtle blurred background (desktop only) + scrim for contrast */}
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            zIndex: 0,
            backgroundImage: isDark
              ? "url('https://images.unsplash.com/photo-1470790376778-125758a68401?q=80&w=1200&auto=format&fit=crop')"
              : "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d9f9a')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            opacity: 0.4,
            transform: 'scale(1.02)',
            backgroundBlendMode: 'normal',
            pointerEvents: 'none',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              animation: 'none',
            },
          }}
        />

        <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 1, background: isDark ? 'transparent' : 'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))', pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h2" component="div" sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    color: textPrimary,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <AnimatedText text="Study. Earn." />
                    <span className="animate-text-gradient" style={{
                      backgroundImage: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899, #6366f1)',
                      display: 'inline-block',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      <AnimatedText text="Redeem." />
                    </span>
                    <AnimatedText text="Repeat!" />
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ mb: 3, color: textSecondary, fontWeight: 500, maxWidth: 500, lineHeight: 1.6 }}>
                  Campus Cash rewards students with meaningful benefits—turn your campus activity into real value.
                </Typography>

                <Typography variant="body1" sx={{ color: textSecondary, mb: 4, opacity: 0.8 }}>
                  Complete tasks, earn points, and redeem them for food, books, and exclusive campus perks.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="contained" size="large" sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: 'white',
                      px: 4, py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      boxShadow: '0 10px 25px -10px rgba(99, 102, 241, 0.5)'
                    }} onClick={() => navigate('/s')}>
                      Join Now
                    </Button>
                  </motion.div>
                  <Button variant="outlined" onClick={() => { const el = document.getElementById('how'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
                    How it works
                  </Button>
                  <Button variant="text" onClick={() => { const el = document.getElementById('rewards'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
                    Explore Rewards
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={parallax} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 8, bgcolor: cardBg }}>
                  <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b7d9b2b8c2d3f2b6b9a" alt="students" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', maxHeight: 380 }} />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      { /* FEATURES (How It Works) */}
      <Container id="how" maxWidth="lg" sx={{ mt: 12, mb: 12 }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Typography variant="h3" sx={{
            textAlign: 'center',
            fontWeight: 800,
            mb: 8,
            background: isDark ? 'linear-gradient(to right, #ffffff, #94a3b8)' : 'linear-gradient(to right, #0f172a, #334155)',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            How it works
          </Typography>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={6} justifyContent="center">
            {featureData.map(({ icon, title, text, color, bgGradient, shadow }, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }} key={index}>
                <motion.div variants={fadeUp} style={{ width: '100%' }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 5,
                      textAlign: 'center',
                      px: 3,
                      py: 5,
                      transition: 'all 0.4s ease-out',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      background: isDark ? 'linear-gradient(145deg, #1e293b, #0f172a)' : 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: shadow,
                        borderColor: color
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: bgGradient,
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box sx={{
                      mb: 3,
                      display: 'inline-flex',
                      p: 2.5,
                      borderRadius: '50%',
                      background: isDark ? `rgba(255,255,255,0.03)` : `rgba(0,0,0,0.03)`,
                      // For colored glow effect on icon background
                      boxShadow: isDark ? `inset 0 0 20px ${color}22` : `none`,
                    }}>
                      {React.cloneElement(icon, { sx: { fontSize: 44, color: color, filter: `drop-shadow(0 4px 8px ${color}44)` } })}
                    </Box>
                    <Typography variant="h5" sx={{ mt: 1, mb: 2, fontWeight: 700, color: textPrimary }}>
                      {title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: textSecondary, lineHeight: 1.6 }}>
                      {text}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* POPULAR REWARDS */}
      <Container id="rewards" maxWidth="lg" sx={{ mt: 10, mb: 16 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              mb: 8,
              background: isDark ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : 'linear-gradient(to right, #d97706, #b45309)',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
            }}
          >
            Popular Rewards
          </Typography>
        </motion.div>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {rewardsData.map(({ img, icon, title, desc, points }, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                width: '100%',
                maxWidth: { xs: '100%', sm: 340, md: 320 },
              }}
            >
              <motion.div
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.15 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Card
                  elevation={6}
                  sx={{
                    maxWidth: 320,
                    width: '100%',
                    borderRadius: 3,
                    borderTop: '6px solid #ffe600',
                    textAlign: 'center',
                    px: 0,
                    py: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    transition: 'box-shadow 0.25s, transform 0.25s',
                    '&:hover': { boxShadow: 14, transform: 'scale(1.04)' },
                    background: isDark ? 'linear-gradient(120deg, #1e1e2e 80%, #2d2d3d 100%)' : 'linear-gradient(120deg, #fff 80%, #f3f3ff 100%)',
                    color: textPrimary,
                  }}
                >
                  <Box sx={{ width: '100%', height: 140, overflow: 'hidden' }}>
                    <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'; }} />
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    {icon}
                    <Typography fontWeight="bold" sx={{ mt: 2, color: accentColor }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: textSecondary }}>{desc}</Typography>
                    <Typography variant="caption" sx={{ color: '#97d700', fontWeight: 'bold', display: 'block', mt: 1 }}>
                      {points}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* WHY CAMPUS CASH */}
      <Container id="why" maxWidth="md" sx={{ mb: 10 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <Box
            sx={{
              background: isDark ? 'linear-gradient(120deg, #2d2d3d 70%, #3d3d4d 100%)' : 'linear-gradient(120deg, #ffe600 70%, #fffde7 100%)',
              borderRadius: 6,
              py: 6,
              px: 5,
              textAlign: 'center',
              boxShadow: 5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 24,
                right: 32,
                fontSize: 60,
                color: '#6444e6',
                opacity: 0.15,
              }}
            >
              <DiamondIcon sx={{ fontSize: 60, color: '#6444e6', opacity: 0.15 }} />
            </motion.div>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDark ? '#8866ff' : '#6444e6', mb: 4 }}>
              Why Campus Cash?
            </Typography>
            <Stack spacing={3} alignItems="center">
              <Chip label="Motivates you with real rewards you care about" sx={{ fontWeight: 'bold', px: 3, py: 1.5, bgcolor: isDark ? '#1a1a2e' : '#fff', color: textPrimary, fontSize: '1.25rem', boxShadow: 2 }} />
              <Chip label="Track points and progress easily—never miss a reward opportunity" sx={{ px: 3, py: 1.5, bgcolor: isDark ? '#1a1a2e' : '#fff', color: textPrimary, fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Leaderboard and badges for extra fun and friendly competition" sx={{ px: 3, py: 1.5, bgcolor: isDark ? '#1a1a2e' : '#fff', color: textPrimary, fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Easy for both students and faculty" sx={{ px: 3, py: 1.5, bgcolor: isDark ? '#1a1a2e' : '#fff', color: textPrimary, fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Always adding new perks and partners" sx={{ px: 3, py: 1.5, bgcolor: isDark ? '#1a1a2e' : '#fff', color: textPrimary, fontSize: '1.25rem', boxShadow: 1 }} />
            </Stack>
          </Box>
        </motion.div>
      </Container>

      {/* TESTIMONIALS */}
      <Container id="testimonials" maxWidth="md" sx={{ mb: 12 }}>
        <Stack spacing={4} alignItems="center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2 }}
          >
            <Paper
              elevation={5}
              sx={{
                maxWidth: 600,
                borderRadius: 4,
                p: 4,
                fontStyle: 'italic',
                textAlign: 'center',
                bgcolor: isDark ? '#1e1e2e' : '#f6f6fa',
                color: textPrimary,
                fontSize: '1.1rem',
                boxShadow: isDark ? '0 8px 32px #6444e633' : '0 8px 32px #6444e622',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: isDark ? '0 12px 48px #6444e655' : '0 12px 48px #6444e644' },
              }}
            >
              "Campus Cash made me excited to finish assignments—I used my first points for coffee and a study buddy snack!"<br />
              <Typography variant="body2" component="span" sx={{ fontStyle: 'normal', color: isDark ? '#888888' : '#888', fontWeight: 'bold' }}>
                – Priya S., Second-year student
              </Typography>
            </Paper>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.4 }}
          >
            <Paper
              elevation={5}
              sx={{
                maxWidth: 600,
                borderRadius: 4,
                p: 4,
                fontStyle: 'italic',
                textAlign: 'center',
                bgcolor: isDark ? '#1e1e2e' : '#f6f6fa',
                color: textPrimary,
                fontSize: '1.1rem',
                boxShadow: isDark ? '0 8px 32px #6444e633' : '0 8px 32px #6444e622',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: isDark ? '0 12px 48px #6444e655' : '0 12px 48px #6444e644' },
              }}
            >
              "It's so easy to recognize student effort now. Tasks get done, students are happier, and engagement is up!"<br />
              <Typography variant="body2" component="span" sx={{ fontStyle: 'normal', color: isDark ? '#888888' : '#888', fontWeight: 'bold' }}>
                – Dr. Anil Kumar, Faculty Advisor
              </Typography>
            </Paper>
          </motion.div>
        </Stack>
      </Container>


    </Box>
  );
}


// import * as React from 'react';
// import { useState } from 'react';
// import {
//   AppBar, Toolbar, Typography, Button, Box, Container, Card, CardContent,
//   Grid, Paper, Divider, Stack, Chip, Link, IconButton, Avatar, LinearProgress,
//   List, ListItem, ListItemAvatar, ListItemText, Badge
// } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
// import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
// import StarsIcon from '@mui/icons-material/Stars';
// import TaskAltIcon from '@mui/icons-material/TaskAlt';
// import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import SchoolIcon from '@mui/icons-material/School';
// import LocalCafeIcon from '@mui/icons-material/LocalCafe';
// import StoreIcon from '@mui/icons-material/Store';
// import PrintIcon from '@mui/icons-material/Print';
// import RestaurantIcon from '@mui/icons-material/Restaurant';
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// import { motion } from 'framer-motion';

// // —— Color tokens (edit to match your brand) ——
// const GRADIENT_PRIMARY = 'linear-gradient(90deg, #6D28D9, #2563EB)'; // purple → blue
// const GRADIENT_ACCENT = 'linear-gradient(90deg, #F59E0B, #F97316)'; // amber → orange
// const BG_SOFT = '#0f1223';
// const CARD_BG = '#11162a';
// const TEXT_SOFT = 'rgba(255,255,255,0.8)';

// // —— Motion helpers ——
// const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
// const pop = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } } };

// function PillButton(props) {
//   return (
//     <Button {...props} sx={{ textTransform: 'none', borderRadius: 999, px: 3, py: 1.2, fontWeight: 800, ...props.sx }} />
//   );
// }

// function Header() {
//   const [open, setOpen] = useState(false);
//   return (
//     <AppBar position="sticky" elevation={0} sx={{ background: BG_SOFT }}>
//       <Toolbar sx={{ height: 64 }}>
//         <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
//           <Box sx={{ width: 28, height: 28, borderRadius: 2, background: GRADIENT_PRIMARY }} />
//           <Typography variant="h6" fontWeight={900}>Campus Cash</Typography>
//         </Stack>
//         <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
//           {['Dashboard','Tasks','Rewards','Leaderboard','Help'].map((x) => (
//             <Button key={x} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>{x}</Button>
//           ))}
//         </Stack>
//         <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
//           <Badge color="secondary" badgeContent={3} overlap="circular">
//             <Avatar sx={{ width: 32, height: 32, bgcolor: '#1e293b' }}>U</Avatar>
//           </Badge>
//         </Stack>
//         <IconButton onClick={() => setOpen(!open)} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'white' }}>
//           <MenuIcon />
//         </IconButton>
//       </Toolbar>
//       {open && (
//         <Container sx={{ display: { xs: 'block', md: 'none' } }}>
//           <Paper sx={{ borderRadius: 3, p: 2, bgcolor: CARD_BG }}>
//             <Stack spacing={1.2}>
//               {['Dashboard','Tasks','Rewards','Leaderboard','Help'].map((x) => <Button key={x} sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'white' }}>{x}</Button>)}
//             </Stack>
//           </Paper>
//         </Container>
//       )}
//     </AppBar>
//   );
// }

// export default function StudentHomeVibrant() {
//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: BG_SOFT, color: 'white' }}>
//       {/* Top strip */}
//       <Box sx={{ background: GRADIENT_PRIMARY }}>
//         <Container sx={{ py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography variant="body2" fontWeight={800}>🎉 Welcome back! Weekly challenge: Finish 3 tasks for a bonus 150 pts.</Typography>
//           <Link href="#" underline="hover" color="#fff">View challenges</Link>
//         </Container>
//       </Box>

//       {/* Header */}
//       <Header />

//       {/* Hero — student‑centric */}
//       <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
//         <Grid container spacing={4} alignItems="center">
//           <Grid item xs={12} md={6}>
//             <Stack spacing={2}>
//               <Chip label="Student Engagement Platform" sx={{ alignSelf: 'flex-start', bgcolor: '#1f2a44', color: '#93c5fd', fontWeight: 800 }} />
//               <Typography component={motion.h1} variants={fadeUp} initial="hidden" animate="visible" sx={{ fontSize: { xs: 36, md: 52 }, fontWeight: 900, lineHeight: 1.1 }}>
//                 Earn points for your work.
//                 <Box component="span" sx={{ display: 'block', background: GRADIENT_PRIMARY, WebkitBackgroundClip: 'text', color: 'transparent' }}>Trade them for real perks.</Box>
//               </Typography>
//               <Typography component={motion.p} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }} sx={{ color: TEXT_SOFT, fontSize: 18 }}>
//                 Complete assignments and milestones. Rack up points. Redeem at the bookstore, cafeteria, and admin offices.
//               </Typography>
//               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
//                 <PillButton variant="contained" sx={{ background: GRADIENT_PRIMARY }}>See Tasks</PillButton>
//                 <PillButton variant="outlined" sx={{ borderColor: '#475569', color: 'white' }}>My Wallet</PillButton>
//               </Stack>
//               <Stack direction="row" spacing={3} sx={{ pt: 1, color: TEXT_SOFT }}>
//                 <Stack direction="row" spacing={1} alignItems="center"><LocalFireDepartmentIcon /> <Typography variant="body2"><b>7‑day</b> streak</Typography></Stack>
//                 <Stack direction="row" spacing={1} alignItems="center"><WorkspacePremiumIcon /> <Typography variant="body2"><b>Top 12%</b> on leaderboard</Typography></Stack>
//               </Stack>
//             </Stack>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             {/* Stat cards */}
//             <Grid container spacing={2}>
//               {[{k:'Points',v:'2,640',icon:<StarsIcon/>},{k:'Completed',v:'18 tasks',icon:<AssignmentTurnedInIcon/>},{k:'Badges',v:'5',icon:<EmojiEventsIcon/>}].map((s,i)=>(
//                 <Grid item xs={12} sm={4} key={i}>
//                   <Card component={motion.div} variants={pop} initial="hidden" animate="visible" sx={{ borderRadius: 3, p: 2, height: '100%', bgcolor: CARD_BG, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//                     <Stack spacing={1}>
//                       <Avatar sx={{ bgcolor: '#1d4ed8' }}>{s.icon}</Avatar>
//                       <Typography variant="h5" fontWeight={900}>{s.v}</Typography>
//                       <Typography variant="caption" color={TEXT_SOFT}>{s.k}</Typography>
//                     </Stack>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* Quick Actions */}
//       <Container maxWidth="lg" sx={{ pb: 8 }}>
//         <Grid container spacing={2}>
//           {[{t:'Submit Assignment',sub:'Due today 6:00 PM',cta:'Open'},{t:'Join Hackathon',sub:'Registration ends Fri',cta:'Register'},{t:'Profile & KYC',sub:'Unlock wallet transfers',cta:'Verify'}].map((a,i)=> (
//             <Grid item xs={12} md={4} key={i}>
//               <Card sx={{ borderRadius: 3, p: 3, bgcolor: CARD_BG, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                   <Avatar sx={{ bgcolor: '#ea580c' }}><TaskAltIcon/></Avatar>
//                   <Box sx={{ flex: 1 }}>
//                     <Typography fontWeight={800}>{a.t}</Typography>
//                     <Typography variant="caption" color={TEXT_SOFT}>{a.sub}</Typography>
//                   </Box>
//                   <PillButton size="small" variant="contained" sx={{ background: GRADIENT_ACCENT }}>{a.cta}</PillButton>
//                 </Stack>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* Upcoming Tasks + Progress */}
//       <Container maxWidth="lg" sx={{ pb: 8 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: CARD_BG, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//               <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
//                 <Typography fontWeight={900}>Upcoming Tasks</Typography>
//                 <Button size="small" endIcon={<ArrowForwardIosIcon fontSize="inherit" />} sx={{ textTransform: 'none' }}>View all</Button>
//               </Stack>
//               <List>
//                 {[
//                   {title:'DBMS Assignment 2', pts:120, due:'Today, 6:00 PM'},
//                   {title:'Mini‑project proposal', pts:300, due:'Wed, 11:00 AM'},
//                   {title:'Math quiz practice', pts:80, due:'Fri, 9:00 PM'}
//                 ].map((t,i)=> (
//                   <ListItem key={i} divider secondaryAction={<Chip label={`+${t.pts} pts`} color="primary" /> }>
//                     <ListItemAvatar><Avatar sx={{ bgcolor: '#2563EB' }}><SchoolIcon/></Avatar></ListItemAvatar>
//                     <ListItemText primary={t.title} secondary={<Typography variant="caption" color={TEXT_SOFT}>{t.due}</Typography>} />
//                   </ListItem>
//                 ))}
//               </List>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ borderRadius: 3, p: 2.5, bgcolor: CARD_BG, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//               <Typography fontWeight={900} sx={{ mb: 1 }}>Semester Progress</Typography>
//               <Typography variant="caption" color={TEXT_SOFT}>Credits completed</Typography>
//               <LinearProgress variant="determinate" value={62} sx={{ height: 10, borderRadius: 6, my: 1 }} />
//               <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
//                 <Typography variant="body2"><b>62%</b> complete</Typography>
//                 <Typography variant="body2" color={TEXT_SOFT}>Target: 80%</Typography>
//               </Stack>
//               <Typography variant="caption" color={TEXT_SOFT}>Weekly streak</Typography>
//               <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
//                 {Array.from({ length: 7 }).map((_, i) => (
//                   <Box key={i} sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: i < 5 ? '#22c55e' : '#334155' }} />
//                 ))}
//               </Stack>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* Redeem — Featured rewards */}
//       <Container maxWidth="lg" sx={{ pb: 10 }}>
//         <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} sx={{ mb: 2 }}>
//           <Typography variant="h5" fontWeight={900}>Redeem fast</Typography>
//           <Button sx={{ textTransform: 'none' }}>See catalog</Button>
//         </Stack>
//         <Grid container spacing={2}>
//           {[
//             {icon:<StoreIcon/>, title:'Bookstore ₹100 off', pts:400},
//             {icon:<LocalCafeIcon/>, title:'Free Cappuccino', pts:110},
//             {icon:<PrintIcon/>, title:'10 Print Credits', pts:150},
//             {icon:<RestaurantIcon/>, title:'Canteen Combo', pts:220},
//           ].map((r,i)=> (
//             <Grid item xs={12} sm={6} md={3} key={i}>
//               <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 3, p: 2.5, bgcolor: CARD_BG, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//                 <Stack spacing={1.2} alignItems="flex-start">
//                   <Avatar sx={{ bgcolor: '#7c3aed' }}>{r.icon}</Avatar>
//                   <Typography fontWeight={800}>{r.title}</Typography>
//                   <Chip label={`${r.pts} pts`} color="secondary" />
//                   <PillButton size="small" variant="contained" sx={{ background: GRADIENT_PRIMARY }}>Redeem</PillButton>
//                 </Stack>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* How it works */}
//       <Container maxWidth="lg" sx={{ pb: 10 }}>
//         <Typography variant="h5" fontWeight={900} align="center" sx={{ mb: 3 }}>How it works</Typography>
//         <Grid container spacing={2}>
//           {[
//             {t:'Do tasks',d:'Finish assignments, projects, attend events',icon:<TaskAltIcon/>},
//             {t:'Earn points',d:'Every action adds to your wallet',icon:<StarsIcon/>},
//             {t:'Redeem',d:'Food, books, printing, admin perks',icon:<EmojiEventsIcon/>},
//           ].map((s,i)=> (
//             <Grid item xs={12} md={4} key={i}>
//               <Card sx={{ borderRadius: 3, p: 3, bgcolor: CARD_BG, textAlign:'center', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
//                 <Avatar sx={{ bgcolor: '#2563EB', mx: 'auto', mb: 1 }}>{s.icon}</Avatar>
//                 <Typography fontWeight={900}>{s.t}</Typography>
//                 <Typography variant="body2" color={TEXT_SOFT}>{s.d}</Typography>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* Footer */}
//       <Box sx={{ background: '#0a0d1b' }}>
//         <Container sx={{ py: 6 }}>
//           <Grid container spacing={4}>
//             <Grid item xs={12} md={4}>
//               <Stack direction="row" spacing={1.2} alignItems="center">
//                 <Box sx={{ width: 28, height: 28, borderRadius: 2, background: GRADIENT_PRIMARY }} />
//                 <Typography variant="h6" fontWeight={900}>Campus Cash</Typography>
//               </Stack>
//               <Typography variant="body2" sx={{ mt: 1, color: TEXT_SOFT }}>
//                 Motivate academic performance with real rewards students love.
//               </Typography>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Typography variant="subtitle2" fontWeight={900}>Explore</Typography>
//               <Stack sx={{ mt: 1 }} spacing={1}>
//                 {['Dashboard','Tasks','Rewards','Leaderboard','Help'].map((x)=> (
//                   <Link key={x} href="#" color={TEXT_SOFT} underline="hover">{x}</Link>
//                 ))}
//               </Stack>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Typography variant="subtitle2" fontWeight={900}>Contact</Typography>
//               <Stack sx={{ mt: 1 }} spacing={1}>
//                 <Typography variant="body2" color={TEXT_SOFT}>info@campuscash.edu</Typography>
//                 <Typography variant="body2" color={TEXT_SOFT}>@campuscash_app</Typography>
//               </Stack>
//             </Grid>
//           </Grid>
//           <Divider sx={{ my: 3, borderColor: '#1f2937' }} />
//           <Typography variant="caption" color={TEXT_SOFT}>© {new Date().getFullYear()} Campus Cash. All rights reserved.</Typography>
//         </Container>
//       </Box>
//     </Box>
//   );
// }
