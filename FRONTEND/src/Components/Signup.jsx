// import { Button, TextField, Typography } from "@mui/material";
// import Box from "@mui/material/Box";
// import axios from "axios";
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Signup = () => {
//   var [input, setInput] = useState({});
//   var baseurl = import.meta.env.VITE_API_BASE_URL;
//   var navigate=useNavigate();
//   const inpuHandler = (e) => {
//     // console.log(e.target.value);
//     setInput({ ...input, [e.target.name]: e.target.value });
//     console.log(input);
//   };
//   const addhandler = () => {
//     console.log("Clicked");
//     axios
//       .post(`${baseurl}/api`, input)
//       .then((res) => {
//         console.log(res);
//         alert(res.data.message);
//         navigate('/L')
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   return (
    
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fa' }}>
//   <Box
//     sx={{
//       width: 400,
//       padding: 4,
//       backgroundColor: "#ffffff",                                             
//       borderRadius: 4,
//       marginTop: 5,
//       boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
//     }}
//   >
//     <Typography variant="h3" gutterBottom align="center" sx={{ fontFamily:"italian",fontWeight: 400, color: "purple" }}>
//     CAMPUS CASH
//     </Typography>
//     <Typography variant="h5" gutterBottom align="center" sx={{ color: "#555",fontFamily:"italian" }}>
//       Signup Form
//     </Typography>

//     <TextField
//       fullWidth
//       label="Fullname"
//       variant="outlined"
//       margin="normal"
//       name="fname"
//       onChange={inpuHandler}
//     />

//     <TextField
//       fullWidth
//       label="Email"
//       variant="outlined"
//       margin="normal"
//       name="ename"
//       onChange={inpuHandler}
//     />

//     <TextField
//       fullWidth
//       label="Password"
//       variant="outlined"
//       margin="normal"
//       name="password"
//       onChange={inpuHandler}
//       type="password"
//     />

//     <Button
  
//       onClick={addhandler}
//       fullWidth
//       variant="contained"
//       sx={{
//         marginTop: 2,
//         backgroundColor: "purple",
//         "&:hover": {
//           backgroundColor: "purple",
//         },
//         fontWeight: 400,
//         fontFamily:"italian"
//       }}
//     >
//       Sign Up
//     </Button>

//     <Typography variant="h6" align="center" sx={{ color: "text.secondary", marginTop: 3 }}>
//       Already a user? <Link to="/L" style={{ fontFamily:"italian",color: "purple", textDecoration: 'none', fontWeight: 500 }}>Login</Link>
//     </Typography>
//   </Box>
// </div>
//   );
// };

// export default Signup;

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
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const inputHandler = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInput({ ...input, [e.target.name]: value });
    if (e.target.name === 'password') setPwdStrength(calcStrength(value));
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
        setSuccessMsg(res.data.message || 'Account created');
        setLoading(false);
        setTimeout(() => navigate('/L'), 900);
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg,#e0c3fc 0%,#8ec5fc 100%)",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 900 },
          display: 'flex',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(16,24,40,0.12)',
          bgcolor: 'background.paper'
        }}
      >
        {/* Left panel with student image */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, position: 'relative', minHeight: 420 }}>
          {/* Background image */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.65) contrast(1.05)',
            }}
          />

          {/* Gradient overlay and content */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(77,59,180,0.45), rgba(108,92,231,0.45))' }} />

          <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6, color: '#fff' }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 84, height: 84, bgcolor: 'rgba(255,255,255,0.85)', color: '#6c5ce7' }}>CC</Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Join Campus Cash</Typography>
              <Typography sx={{ opacity: 0.95, maxWidth: 300, textAlign: 'center' }}>
                Earn points for campus activities, redeem rewards and stay motivated.
              </Typography>
              <Divider sx={{ width: 120, bgcolor: 'rgba(255,255,255,0.25)' }} />
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Student-friendly</Typography>
                <Typography sx={{ fontWeight: 600 }}>Secure & Simple</Typography>
                <Typography sx={{ fontWeight: 600 }}>Instant Rewards</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Right: form */}
        <Box sx={{ flex: 1, p: { xs: 3, md: 6 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Create your account</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>Sign up with your college email</Typography>

          <Stack spacing={2}>
            <TextField fullWidth label="Full name" name="fname" value={input.fname || ''} onChange={inputHandler} error={!!errors.fname} helperText={errors.fname} />
            <TextField fullWidth label="College email" name="ename" value={input.ename || ''} onChange={inputHandler} error={!!errors.ename} helperText={errors.ename} />
            <TextField fullWidth label="Student ID" name="studentId" value={input.studentId || ''} onChange={inputHandler} error={!!errors.studentId} helperText={errors.studentId} />

            <TextField
              fullWidth
              label="Password"
              name="password"
              value={input.password || ''}
              onChange={inputHandler}
              error={!!errors.password}
              helperText={errors.password}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={togglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <LinearProgress variant="determinate" value={pwdStrength} sx={{ height: 8, borderRadius: 2 }} />

            <TextField select fullWidth label="Year / Class / Department" name="yearClassDept" value={input.yearClassDept || ''} onChange={inputHandler} error={!!errors.yearClassDept} helperText={errors.yearClassDept}>
              <MenuItem value="">Select Year / Class / Dept</MenuItem>
              <MenuItem value="Year 1">First Year</MenuItem>
              <MenuItem value="Year 2">Second Year</MenuItem>
              <MenuItem value="Year 3">Third Year</MenuItem>
              <MenuItem value="Year 4">Final Year</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <FormControlLabel control={<Checkbox name="termsAccepted" checked={!!input.termsAccepted} onChange={inputHandler} />} label={<span>I agree to the <Link to="/terms">Terms of Service</Link></span>} />

            {errors.form && <Alert severity="error">{errors.form}</Alert>}

            <Button onClick={addHandler} disabled={loading} fullWidth variant="contained" sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', background: 'linear-gradient(90deg,#4d3bb4,#6c5ce7)' }}>{loading ? 'Creating account...' : 'Sign Up'}</Button>

            <Divider>OR</Divider>

            <Stack direction="row" spacing={2}>
              <Button startIcon={<GoogleIcon />} variant="outlined" fullWidth>Continue with Google</Button>
              <Button startIcon={<GitHubIcon />} variant="outlined" fullWidth>Continue with GitHub</Button>
            </Stack>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>Already a user? <Link to="/L">Login</Link></Typography>
          </Stack>

        </Box>
      </Box>

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}>
        <Alert severity="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Signup;
