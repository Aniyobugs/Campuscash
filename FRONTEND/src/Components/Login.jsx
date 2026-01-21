import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Paper,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Login = () => {
  const [input, setInput] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');

  const inpuHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const addhandler = async () => {
    const next = {};
    if (!input.ename) next.ename = 'Please enter email';
    if (!input.password) next.password = 'Please enter password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/api/login`, input);
      setLoading(false);
      setAlert(res.data.message || 'Logged in successfully');

      if (res.status === 200 && res.data.user) {
        if (login) login(res.data.user, res.data.token);
        if (res.data.token) sessionStorage.setItem('token', res.data.token);

        // Add a small delay for animation if desired, or navigate immediately
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'store') navigate('/store');
        else if (role === 'faculty') navigate('/faculty');
        else navigate('/user');
      }
    } catch (err) {
      setLoading(false);
      setErrors({ form: err.response?.data?.message || 'Invalid credentials' });
    }
  };

  // Styles
  const gradientBg = isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #f0f9ff 100%)'; // Fresh green/blue tint for Campus Cash

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: gradientBg,
      position: 'relative',
      overflow: 'hidden',
      p: 2
    }}>
      {/* Decorative Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(74, 222, 128, 0.2)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.2)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: 1000, position: 'relative', zIndex: 1 }}
      >
        <Paper elevation={24} sx={{
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
          boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}>

          {/* Left Side - Image & Hero */}
          {!isMobile && (
            <Box sx={{
              flex: 1,
              position: 'relative',
              background: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 6
            }}>
              <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)'
              }} />

              <Box sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', mb: 3, boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)' }}>CC</Avatar>
                  <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: -1 }}>
                    Campus Cash.
                  </Typography>
                  <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 350 }}>
                    The smart way to verify, redeem, and manage campus rewards seamlessly.
                  </Typography>
                </motion.div>
              </Box>
            </Box>
          )}

          {/* Right Side - Form */}
          <Box sx={{
            flex: 1,
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please enter your details to sign in
                </Typography>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email or Student ID"
                  name="ename"
                  value={input.ename || ''}
                  onChange={inpuHandler}
                  error={!!errors.ename}
                  helperText={errors.ename}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />

                <Box>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={input.password || ''}
                    onChange={inpuHandler}
                    error={!!errors.password}
                    helperText={errors.password}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormControlLabel
                      control={<Checkbox name="remember" size="small" />}
                      label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                    />
                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" color="primary" fontWeight="600">
                        Forgot Password?
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </Stack>

              {errors.form && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.form}
                  {typeof errors.form === 'string' && errors.form.toLowerCase().includes('inactive') && (
                    <Box sx={{ mt: 1 }}>
                      <Link to="/contact" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}>
                        Contact Admin
                      </Link>
                    </Box>
                  )}
                </Alert>
              )}

              <Button
                onClick={addhandler}
                disabled={loading}
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: '700',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.5)',
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 24px -4px rgba(99, 102, 241, 0.6)',
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Divider sx={{ color: 'text.secondary', typography: 'caption' }}>OR CONTINUE WITH</Divider>

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
                >
                  GitHub
                </Button>
              </Stack>

              <Typography variant="body2" align="center" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/s" style={{ textDecoration: 'none' }}>
                  <Typography component="span" fontWeight="700" color="primary">
                    Sign up
                  </Typography>
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </motion.div>

      {/* Snackbar Feedback */}
      <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setAlert('')} sx={{ borderRadius: 3 }}>
          {alert}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;