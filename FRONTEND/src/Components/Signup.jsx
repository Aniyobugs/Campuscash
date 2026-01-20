import {
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  MenuItem,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Alert,
  Stack,
  Divider,
  Avatar,
  Box,
  Paper,
  useMediaQuery,
  alpha
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolIcon from '@mui/icons-material/School';
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Signup = () => {
  const [input, setInput] = useState({
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [pwdStrength, setPwdStrength] = useState(0);

  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');

  const inputHandler = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInput({ ...input, [e.target.name]: value });
    if (e.target.name === 'password') setPwdStrength(calcStrength(value));
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const addHandler = () => {
    // frontend validation
    const nextErrors = {};
    if (!input.fname) nextErrors.fname = 'Full name is required';
    if (!input.ename || !/^\S+@\S+\.\S+$/.test(input.ename)) nextErrors.ename = 'Enter a valid college email';
    if (!input.password || input.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (!input.studentId) nextErrors.studentId = 'Student ID is required';
    if (!input.yearClassDept) nextErrors.yearClassDept = 'Please select your year/class/department';
    if (!input.termsAccepted) nextErrors.termsAccepted = 'You must accept the Terms of Service';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);

    axios
      .post(`${baseurl}/api`, input)
      .then((res) => {
        setSuccessMsg(res.data.message || 'Account created successfully!');
        setLoading(false);
        setTimeout(() => navigate('/L'), 1500);
      })
      .catch((error) => {
        setLoading(false);
        const msg = error.response?.data?.message || 'Signup failed';
        setErrors({ form: msg });
      });
  };

  const calcStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) score += 30;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 30;
    return Math.min(100, score);
  };

  const togglePassword = () => setShowPassword((s) => !s);

  // Styling Constants
  const gradientBg = isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #f0f9ff 100%)';

  const passwordColor = pwdStrength < 40 ? 'error' : pwdStrength < 80 ? 'warning' : 'success';

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: gradientBg,
        position: 'relative',
        overflow: 'hidden',
        p: 2
      }}
    >
      {/* Decorative Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(244, 114, 182, 0.2)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(96, 165, 250, 0.2)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: 1100, position: 'relative', zIndex: 1 }}
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

          {/* Left Side - Hero Image */}
          {!isMobile && (
            <Box sx={{
              flex: 1,
              position: 'relative',
              background: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)' }}>
                      <SchoolIcon fontSize="large" />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: -1 }}>
                    Join the Community.
                  </Typography>
                  <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 400 }}>
                    Unlock exclusive student rewards, track your achievements, and level up your campus life.
                  </Typography>
                </motion.div>
              </Box>
            </Box>
          )}

          {/* Right Side - Signup Form */}
          <Box sx={{
            flex: 1,
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight="800" color="text.primary" gutterBottom>
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join us today! Enter your details below.
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fname"
                  value={input.fname || ''}
                  onChange={inputHandler}
                  error={!!errors.fname}
                  helperText={errors.fname}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField
                  fullWidth
                  label="College Email"
                  name="ename"
                  value={input.ename || ''}
                  onChange={inputHandler}
                  error={!!errors.ename}
                  helperText={errors.ename}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    name="studentId"
                    value={input.studentId || ''}
                    onChange={inputHandler}
                    error={!!errors.studentId}
                    helperText={errors.studentId}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Year / Dept"
                    name="yearClassDept"
                    value={input.yearClassDept || ''}
                    onChange={inputHandler}
                    error={!!errors.yearClassDept}
                    helperText={errors.yearClassDept}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Year 1">Year 1</MenuItem>
                    <MenuItem value="Year 2">Year 2</MenuItem>
                    <MenuItem value="Year 3">Year 3</MenuItem>
                    <MenuItem value="Year 4">Year 4</MenuItem>
                    <MenuItem value="Faculty">Faculty</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={input.password || ''}
                    onChange={inputHandler}
                    error={!!errors.password}
                    helperText={errors.password}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  {input.password && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pwdStrength}
                        color={passwordColor}
                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: alpha(isDark ? '#fff' : '#000', 0.1) }}
                      />
                      <Typography variant="caption" fontWeight="bold" color={`${passwordColor}.main`}>
                        {pwdStrength < 40 ? 'Weak' : pwdStrength < 80 ? 'Good' : 'Strong'}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <FormControlLabel
                  control={<Checkbox name="termsAccepted" checked={!!input.termsAccepted} onChange={inputHandler} />}
                  label={<Typography variant="body2" color="text.secondary">I agree to the Terms of Service</Typography>}
                />
              </Stack>

              {errors.form && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.form}
                </Alert>
              )}

              <Button
                onClick={addHandler}
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              <Divider sx={{ color: 'text.secondary', typography: 'caption' }}>OR SIGN UP WITH</Divider>

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
                Already have an account?{' '}
                <Link to="/L" style={{ textDecoration: 'none' }}>
                  <Typography component="span" fontWeight="700" color="primary">
                    Log in
                  </Typography>
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </motion.div>

      {/* Snackbar Feedback */}
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 3 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Signup;
