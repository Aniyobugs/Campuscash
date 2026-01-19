
import React from 'react';
import { Box, Container, Grid, Typography, Stack, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const accentColor = '#6444e6';
    const yellowAccent = '#ffe600';

    return (
        <Box sx={{ bgcolor: accentColor, color: '#fff', py: 6, mt: 'auto' }}>
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
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/')}
                                color="inherit"
                                underline="hover"
                                sx={{ textAlign: 'left', transition: 'color 0.2s', '&:hover': { color: yellowAccent } }}
                            >
                                Home
                            </Link>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/about')}
                                color="inherit"
                                underline="hover"
                                sx={{ textAlign: 'left', transition: 'color 0.2s', '&:hover': { color: yellowAccent } }}
                            >
                                About Us
                            </Link>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/contact')}
                                color="inherit"
                                underline="hover"
                                sx={{ textAlign: 'left', transition: 'color 0.2s', '&:hover': { color: yellowAccent } }}
                            >
                                Contact Us
                            </Link>
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
                <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                <Typography variant="caption" display="block" align="center">
                    © 2025 Campus Cash. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
