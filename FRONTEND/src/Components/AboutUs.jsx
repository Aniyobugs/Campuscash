
import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';

const AboutUs = () => {
    return (
        <Box sx={{ minHeight: '80vh', py: 8 }}>
            <Container maxWidth="lg">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h2" fontWeight="800" gutterBottom sx={{ color: 'primary.main' }}>
                            About Campus Cash
                        </Typography>
                        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
                            Revolutionizing student engagement through gamification and real-world rewards.
                        </Typography>
                    </Box>
                </motion.div>

                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 4 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
                                    alt="Team collaboration"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                            <Typography variant="h4" fontWeight="700" gutterBottom>
                                Our Mission
                            </Typography>
                            <Typography paragraph color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                                Campus Cash was born from a simple idea: academic effort should be recognized and rewarded instantly. We believe that when students are motivated by tangible benefits, engagement skyrockets and campus life becomes more vibrant.
                            </Typography>
                            <Typography paragraph color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                                By bridging the gap between administrative goals and student interests, we create a win-win ecosystem where learning pays off—literally.
                            </Typography>
                        </motion.div>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 12 }}>
                    <Grid container spacing={4} justifyContent="center">
                        {[
                            { icon: <EmojiEventsIcon fontSize="large" />, title: 'Reward Excellence', text: ' recognizing every achievement, big or small.' },
                            { icon: <SchoolIcon fontSize="large" />, title: 'Enhance Learning', text: 'Making academic participation exciting and value-driven.' },
                            { icon: <GroupsIcon fontSize="large" />, title: 'Build Community', text: 'Connecting students, faculty, and campus services.' },
                        ].map((item, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        borderRadius: 4,
                                        height: '100%',
                                        transition: 'transform 0.3s',
                                        '&:hover': { transform: 'translateY(-8px)' }
                                    }}
                                >
                                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'secondary.main' }}>
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {item.text}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default AboutUs;
