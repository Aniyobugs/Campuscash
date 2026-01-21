
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, Grid, TextField, Button, Paper, Stack, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';

const ContactUs = () => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const baseurl = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${baseurl}/api/contact/submit`, form);
            setSent(true);
            setForm({ firstName: '', lastName: '', email: '', message: '' });
        } catch (err) {
            console.error(err);
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <Box sx={{ minHeight: '80vh', py: 8 }}>
            <Container maxWidth="lg">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <Typography variant="h2" fontWeight="800" align="center" gutterBottom sx={{ color: 'primary.main', mb: 6 }}>
                        Get in Touch
                    </Typography>
                </motion.div>

                <Grid container spacing={6}>
                    <Grid item xs={12} md={5}>
                        <Stack spacing={4}>
                            <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                                    Contact Information
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, color: 'white' }}>
                                    Have questions about points, rewards, or technical issues? We're here to help!
                                </Typography>

                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <EmailIcon sx={{ color: 'white' }} />
                                        <Typography sx={{ color: 'white' }}>support@campuscash.edu</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <PhoneIcon sx={{ color: 'white' }} />
                                        <Typography sx={{ color: 'white' }}>+91 91885 266 52, 9037302187</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <LocationOnIcon sx={{ color: 'white' }} />
                                        <Typography sx={{ color: 'white' }}>
                                            Nirmala College of Arts and Science,<br />
                                            Chalakudy, Kerala - 680307
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Send us a Message
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField required fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField required fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField required fullWidth type="email" label="Email Address" name="email" value={form.email} onChange={handleChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField required fullWidth multiline rows={4} label="Message" name="message" value={form.message} onChange={handleChange} variant="outlined" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            endIcon={<SendIcon />}
                                            sx={{ py: 1.5, fontWeight: 'bold' }}
                                        >
                                            Send Message
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar open={sent} autoHideDuration={4000} onClose={() => setSent(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSent(false)} severity="success" sx={{ width: '100%' }}>
                        Message sent successfully! We'll get back to you soon.
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default ContactUs;
