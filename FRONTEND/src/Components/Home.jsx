import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Card,
  Grid, Paper, Divider, Stack, Chip, Link
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DiamondIcon from '@mui/icons-material/Diamond';
import RedeemIcon from '@mui/icons-material/Redeem';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import StoreIcon from '@mui/icons-material/Store';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const featureData = [
  {
    icon: <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />,
    title: '1. Complete Tasks',
    text: 'Assignments, projects, and campus activities earn you points—effort counts everywhere.',
  },
  {
    icon: <DiamondIcon sx={{ color: '#07c8f9', fontSize: 48 }} />,
    title: '2. Earn Points',
    text: 'Track your progress and see your point balance grow in your personalized dashboard.',
  },
  {
    icon: <RedeemIcon color="warning" sx={{ fontSize: 48 }} />,
    title: '3. Redeem Rewards',
    text: 'Use your points for discounts at the bookstore, free coffee, library perks, or admin services!',
  },
];

const rewardsData = [
  {
    icon: <StoreIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Campus Store Discount',
    desc: 'Get 10% off textbooks and supplies!',
    points: '500 Points',
  },
  {
    icon: <LocalCafeIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Free Coffee',
    desc: 'Grab a drink at the campus café.',
    points: '100 Points',
  },
  {
    icon: <ReceiptIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Transcript Fee Waiver',
    desc: 'Waive your admin transcript fee.',
    points: '200 Points',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#6444e6' }} />,
    title: 'Library Extension',
    desc: 'Extra week for book returns.',
    points: '80 Points',
  },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};
const parallax = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: 'spring' } }
};

export default function Home() {
  return (
    <Box sx={{ bgcolor: '#f8f8ff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />



      {/* HERO SECTION */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #6444e6 0%, #07c8f9 100%)',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated floating shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, yoyo: Infinity }}
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            width: 80,
            height: 80,
            background: '#ffe600',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(2px)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, yoyo: Infinity }}
          style={{
            position: 'absolute',
            bottom: 30,
            right: 80,
            width: 60,
            height: 60,
            background: '#fff',
            borderRadius: '50%',
            zIndex: 0,
            filter: 'blur(2px)'
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="h2" sx={{
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 4px 24px #6444e6'
            }}>
              Study. Earn. Redeem. Repeat!
            </Typography>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Campus Cash motivates students with real rewards for academic achievement and campus engagement.
            </Typography>
          </motion.div>
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <Typography variant="body1" sx={{
              color: '#ffe600',
              fontWeight: 'bold',
              mb: 4,
              fontSize: '1.2rem'
            }}>
              Complete tasks, earn points, and redeem them for food, books, perks & more!
            </Typography>
          </motion.div>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            <motion.div whileHover={{ scale: 1.08 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#ffe600',
                  color: '#6444e6',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 5,
                  py: 1.5,
                  fontSize: 18,
                  boxShadow: 4,
                  borderRadius: 3,
                  '&:hover': { bgcolor: '#fff159' },
                  transition: 'transform 0.2s',
                }}
              >
                Join Now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 5,
                  py: 1.5,
                  fontSize: 18,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                }}
              >
                How It Works
              </Button>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={6} justifyContent="center">
          {featureData.map(({ icon, title, text }, index) => (
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }} key={index}>
              <motion.div
                variants={parallax}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.2 }}
                style={{ width: '100%' }}
              >
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 4,
                    maxWidth: 340,
                    textAlign: 'center',
                    px: 3,
                    py: 4,
                    transition: 'box-shadow 0.3s, transform 0.3s',
                    '&:hover': { boxShadow: 12, transform: 'translateY(-8px) scale(1.04)' },
                    background: 'linear-gradient(120deg, #fff 80%, #f3f3ff 100%)',
                  }}
                >
                  {icon}
                  <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold', color: '#6444e6' }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {text}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* POPULAR REWARDS */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#6444e6',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '0 2px 12px #ffe600',
            }}
          >
            Popular Rewards
          </Typography>
        </motion.div>
        <Grid container spacing={4} justifyContent="center">
          {rewardsData.map(({ icon, title, desc, points }, idx) => (
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }} key={idx}>
              <motion.div
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.15 }}
                style={{ width: '100%' }}
              >
                <Card
                  elevation={6}
                  sx={{
                    maxWidth: 320,
                    width: '100%',
                    borderRadius: 3,
                    borderTop: '6px solid #ffe600',
                    textAlign: 'center',
                    px: 3,
                    py: 4,
                    transition: 'box-shadow 0.25s, transform 0.25s',
                    '&:hover': { boxShadow: 14, transform: 'scale(1.05)' },
                    background: 'linear-gradient(120deg, #fff 80%, #f3f3ff 100%)',
                  }}
                >
                  {icon}
                  <Typography fontWeight="bold" sx={{ mt: 3, color: '#6444e6' }}>
                    {title}
                  </Typography>
                  <Typography variant="body2">{desc}</Typography>
                  <Typography variant="caption" sx={{ color: '#97d700', fontWeight: 'bold', display: 'block', mt: 1 }}>
                    {points}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* WHY CAMPUS CASH */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(120deg, #ffe600 70%, #fffde7 100%)',
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6444e6', mb: 4 }}>
              Why Campus Cash?
            </Typography>
            <Stack spacing={3} alignItems="center">
              <Chip label="Motivates you with real rewards you care about" sx={{ fontWeight: 'bold', px: 3, py: 1.5, bgcolor: '#fff', fontSize: '1.25rem', boxShadow: 2 }} />
              <Chip label="Track points and progress easily—never miss a reward opportunity" sx={{ px: 3, py: 1.5, bgcolor: '#fff', fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Leaderboard and badges for extra fun and friendly competition" sx={{ px: 3, py: 1.5, bgcolor: '#fff', fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Easy for both students and faculty" sx={{ px: 3, py: 1.5, bgcolor: '#fff', fontSize: '1.25rem', boxShadow: 1 }} />
              <Chip label="Always adding new perks and partners" sx={{ px: 3, py: 1.5, bgcolor: '#fff', fontSize: '1.25rem', boxShadow: 1 }} />
            </Stack>
          </Box>
        </motion.div>
      </Container>

      {/* TESTIMONIALS */}
      <Container maxWidth="md" sx={{ mb: 12 }}>
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
                bgcolor: '#f6f6fa',
                fontSize: '1.1rem',
                boxShadow: '0 8px 32px #6444e622',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: '0 12px 48px #6444e644' },
              }}
            >
              “Campus Cash made me excited to finish assignments—I used my first points for coffee and a study buddy snack!”<br />
              <Typography variant="body2" component="span" sx={{ fontStyle: 'normal', color: '#888', fontWeight: 'bold' }}>
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
                bgcolor: '#f6f6fa',
                fontSize: '1.1rem',
                boxShadow: '0 8px 32px #6444e622',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: '0 12px 48px #6444e644' },
              }}
            >
              “It’s so easy to recognize student effort now. Tasks get done, students are happier, and engagement is up!”<br />
              <Typography variant="body2" component="span" sx={{ fontStyle: 'normal', color: '#888', fontWeight: 'bold' }}>
                – Dr. Anil Kumar, Faculty Advisor
              </Typography>
            </Paper>
          </motion.div>
        </Stack>
      </Container>

      {/* FOOTER */}
      <Box sx={{ bgcolor: '#6444e6', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold">
                Campus Cash
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Where every achievement pays off. Motivate. Reward. Succeed.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold">
                Explore
              </Typography>
              <Stack sx={{ mt: 1 }} spacing={1}>
                {['How It Works', 'Rewards', 'Why Us', 'Testimonials'].map((text) => (
                  <Link key={text} href="#" color="inherit" underline="hover" sx={{
                    transition: 'color 0.2s',
                    '&:hover': { color: '#ffe600' }
                  }}>
                    {text}
                  </Link>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold">
                Contact
              </Typography>
              <Stack sx={{ mt: 1 }} spacing={1}>
                <Typography variant="body2">info@campuscash.edu</Typography>
                <Typography variant="body2">@campuscash_app</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: '#8765e6' }} />
          <Typography variant="caption" display="block" align="center">
            © 2025 Campus Cash. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
