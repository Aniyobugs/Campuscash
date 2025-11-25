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

     { /* FEATURES */}
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
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {rewardsData.map(({ icon, title, desc, points }, idx) => (
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
              px: 3,
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
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
