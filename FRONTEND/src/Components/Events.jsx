import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, TextField, Grid, Paper,
    Card, Alert, Snackbar, Stack, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Events() {
    const { isDark } = useTheme();
    const baseurl = import.meta.env.VITE_API_BASE_URL;

    const [activeBanner, setActiveBanner] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        department: '',
        year: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await axios.get(`${baseurl}/api/events/active`);
                if (res.data) {
                    setActiveBanner(res.data);
                }
            } catch (err) {
                console.log("No active banner or error fetching");
            }
        };
        fetchBanner();
    }, [baseurl]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${baseurl}/api/volunteers/apply`, {
                ...formData,
                eventId: activeBanner ? activeBanner._id : null
            });
            setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' });
            setFormData({ name: '', email: '', studentId: '', department: '', year: '', reason: '' });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to submit application. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';
    const cardBg = isDark ? '#1e293b' : '#ffffff';

    return (
        <Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
            {/* Banner Section */}
            <AnimatePresence>
                {activeBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box sx={{
                            position: 'relative',
                            borderRadius: 4,
                            overflow: 'hidden',
                            mb: 8,
                            boxShadow: isDark ? '0 20px 50px -10px rgba(0,0,0,0.5)' : '0 20px 50px -10px rgba(0,0,0,0.2)',
                            background: isDark ? '#1e1e2e' : '#fff',
                        }}>
                            <Box
                                component="div"
                                sx={{
                                    width: '100%',
                                    height: { xs: 200, md: 400 },
                                    backgroundColor: isDark ? '#2d2d3d' : '#f1f1f1',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                {activeBanner.imageUrl ? (
                                    <img
                                        src={activeBanner.imageUrl.startsWith('http') ? activeBanner.imageUrl : `${baseurl}${activeBanner.imageUrl}`}
                                        alt={activeBanner.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <Typography variant="h4" color="textSecondary">No Image Available</Typography>
                                )}
                            </Box>

                            <Box sx={{ p: 4 }}>
                                <Typography variant="h3" fontWeight="bold" sx={{
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    {activeBanner.title}
                                </Typography>
                                <Typography variant="h6" color={textSecondary}>
                                    {activeBanner.description}
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Volunteer Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <Card elevation={0} sx={{
                            p: { xs: 3, md: 6 },
                            borderRadius: 4,
                            bgcolor: cardBg,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.05)'
                        }}>
                            <Typography variant="h4" fontWeight="800" align="center" sx={{ mb: 1, color: textPrimary }}>
                                Join as a Volunteer
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ mb: 4, color: textSecondary }}>
                                Become part of our team and help us organize amazing events!
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ style: { color: textSecondary } }}
                                        InputProps={{ style: { color: textPrimary } }}
                                    />
                                    <TextField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        InputLabelProps={{ style: { color: textSecondary } }}
                                        InputProps={{ style: { color: textPrimary } }}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Student ID"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                                InputLabelProps={{ style: { color: textSecondary } }}
                                                InputProps={{ style: { color: textPrimary } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth required>
                                                <InputLabel sx={{ color: textSecondary }} id="year-label">Year / Class</InputLabel>
                                                <Select
                                                    labelId="year-label"
                                                    id="year"
                                                    name="year"
                                                    value={formData.year}
                                                    label="Year / Class"
                                                    onChange={handleChange}
                                                    sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' } }}
                                                >
                                                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <FormControl fullWidth required>
                                        <InputLabel sx={{ color: textSecondary }} id="dept-label">Department</InputLabel>
                                        <Select
                                            labelId="dept-label"
                                            id="department"
                                            name="department"
                                            value={formData.department}
                                            label="Department"
                                            onChange={handleChange}
                                            sx={{ color: textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' } }}
                                        >
                                            {['English', 'Food Technology', 'Commerce', 'Computer Science', 'Multimedia', 'Hotel Management', 'Tourism Management', 'Costume & Fashion Designing', 'Management', 'Language', 'Mathematics'].map((dept) => (
                                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Why do you want to volunteer?"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        multiline
                                        rows={4}
                                        InputLabelProps={{ style: { color: textSecondary } }}
                                        InputProps={{ style: { color: textPrimary } }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                                        }}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </Stack>
                            </form>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
