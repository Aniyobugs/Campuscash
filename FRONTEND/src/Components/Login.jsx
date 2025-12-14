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
} from '@mui/material'
import axios from 'axios'
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
const Login = () => {
  const [input, setInput] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { login } = useAuth();

  const inpuHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
      //   const addhandler=()=>
      //     axios
      // .post(`${baseurl}/api/login`, input)
      // .then((res) => {
      //   console.log(res.data);
      //   alert(res.data.message)
      //   sessionStorage.setItem("role",res.data.user.role)
      //   if(res.status===200){
      //     alert(res.data.message)
      //     if(res.data.user.role=='admin'){
      //       navigate('/admin')
      //     }else{
      //       navigate('/user')
      //   }
      // }
    
      // })  
      // .catch((error) => {
      //   console.log(error);
      // });
  const addhandler = async () => {
    // simple validation
    const next = {};
    if (!input.ename) next.ename = 'Please enter email';
    if (!input.password) next.password = 'Please enter password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/api/login`, input);
      setLoading(false);
      setAlert(res.data.message || 'Logged in');

      if (res.status === 200 && res.data.user) {
        if (login) login(res.data.user, res.data.token);
        if (res.data.token) sessionStorage.setItem('token', res.data.token);
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'store') navigate('/store');
        else navigate('/user');
      }
    } catch (err) {
      setLoading(false);
      setErrors({ form: err.response?.data?.message || 'Login failed' });
    }
  };

  return (

    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)' }}>
      <Box sx={{ width: { xs: '100%', md: 900 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 40px rgba(2,6,23,0.08)', bgcolor: 'background.paper' }}>

        {/* Left image */}
        <Box sx={{ display: 'block', flex: { xs: 'none', md: 1 }, position: 'relative', height: { xs: 220, md: 'auto' } }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }} />
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', p: 4 }}>
            <Stack spacing={1} alignItems='center'>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.9)', color: '#6c5ce7' }}>CC</Avatar>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Welcome back</Typography>
              <Typography sx={{ textAlign: 'center', maxWidth: 220 }}>Sign in to track your points and redeem rewards.</Typography>
            </Stack>
          </Box>
        </Box>

        {/* Right form */}
        <Box sx={{ flex: 1, p: { xs: 3, md: 6 } }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>Sign in</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>Use your college email to continue</Typography>

          <Stack spacing={2}>
            <TextField fullWidth label='Email address' name='ename' value={input.ename || ''} onChange={inpuHandler} error={!!errors.ename} helperText={errors.ename} />
            <TextField fullWidth label='Password' name='password' value={input.password || ''} onChange={inpuHandler} type={showPassword ? 'text' : 'password'} error={!!errors.password} helperText={errors.password} InputProps={{ endAdornment: (<InputAdornment position='end'><IconButton onClick={() => setShowPassword(s => !s)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel control={<Checkbox name='remember' />} label='Remember me' />
              <Link to='/forgot-password' style={{ color: '#4d3bb4', textDecoration: 'none' }}>Forgot password?</Link>
            </Box>

            {errors.form && <Alert severity='error'>{errors.form}</Alert>}

            <Button onClick={addhandler} disabled={loading} fullWidth variant='contained' sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', background: 'linear-gradient(90deg,#4d3bb4,#6c5ce7)' }}>{loading ? 'Signing in...' : 'Continue'}</Button>

            <Divider>OR</Divider>

            <Stack direction='row' spacing={2}>
              <Button variant='outlined' fullWidth startIcon={<GoogleIcon />}>Continue with Google</Button>
              <Button variant='outlined' fullWidth startIcon={<GitHubIcon />}>Continue with GitHub</Button>
            </Stack>

            <Typography variant='body2' sx={{ textAlign: 'center' }}>Don't have an account? <Link to='/s'>Sign up</Link></Typography>
          </Stack>

        </Box>
      </Box>

      <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert('')}>
        <Alert severity='success' onClose={() => setAlert('')}>{alert}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Login