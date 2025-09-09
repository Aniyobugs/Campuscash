import { Box, Button, TextField, Typography } from '@mui/material'
import axios from 'axios'
import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Divider from '@mui/material/Divider';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
const Login = () => {
    var[input,setInput] =useState({})
    var baseurl = import.meta.env.VITE_API_BASE_URL;
    var navigate=useNavigate();
        const inpuHandler =(e)=>{
            // console.log(e.target.value)
            setInput({...input,[e.target.name]:e.target.value})
            console.log(input)
            
        }
        const addhandler=()=>
          axios
      .post(`${baseurl}/api/login`, input)
      .then((res) => {
        console.log(res.data);
        alert(res.data.message)
        sessionStorage.setItem("role",res.data.user.role)
        if(res.status===200){
          alert(res.data.message)
          if(res.data.user.role=='admin'){
            navigate('/admin')
          }else{
            navigate('/user')
        }
      }
    
      })  
      .catch((error) => {
        console.log(error);
      });
          

            console.log("Clicked")
    
  return (
   

<div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  minHeight: '100vh', 
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)' 
}}>
  <Box
    sx={{
      width: 380,
      padding: '40px 32px',
      backgroundColor: "#ffffff",
      borderRadius: '12px',
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      textAlign: 'center',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}
  >
    <Typography 
      variant="h4" 
      gutterBottom 
      sx={{ 
        fontFamily:"italian", 
        fontWeight: 600, 
        color: '#2d3748',
        letterSpacing: '-0.5px',
        marginBottom: '24px'
      }}
    >
      Welcome back to Campus Cash
    </Typography>
    
    <Typography 
      variant="subtitle1" 
      gutterBottom 
      sx={{ 
        color: "#718096", 
        marginBottom: 4,
        fontSize: '15px'
      }}
    >
      Sign in to your account
    </Typography>

    <TextField
      fullWidth
      label="Email address"
      variant="outlined"
      margin="normal"
      name="ename"
      onChange={inpuHandler}
      sx={{
        marginBottom: '16px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px'
        }
      }}
    />

    <TextField
      fullWidth
      label="Password"
      variant="outlined"
      margin="normal"
      name="password"
      type="password"
      onChange={inpuHandler}
      sx={{
        marginBottom: '8px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px'
        }
      }}
    />

    <div style={{ 
      textAlign: 'right', 
      marginBottom: '24px' 
    }}>
      <Link 
        to="/forgot-password" 
        style={{ 
          color: "#4299e1", 
          fontSize: '14px', 
          textDecoration: 'none',
          fontWeight: 500 
        }}
      >
        Forgot password?
      </Link>
    </div>

    <Button
      onClick={addhandler}
      fullWidth
      variant="contained"
      sx={{
        backgroundColor: "#4299e1",
        marginTop: 1,
        fontWeight: '600',
        padding: '12px',
        borderRadius: '8px',
        textTransform: 'none',
        fontSize: '15px',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: "#3182ce",
          boxShadow: 'none'
        },
      }}
    >
      Continue
    </Button>

    <Typography 
      variant="body2" 
      sx={{ 
        color: "#718096", 
        marginTop: 4,
        fontSize: '14px'
      }}
    >
      Don't have an account?{' '}
      <Link 
        to="/" 
        style={{ 
          color: "#4299e1", 
          fontWeight: 600, 
          textDecoration: 'none' 
        }}
      >
        Sign up
      </Link>
    </Typography>

    <Divider sx={{ 
      margin: '32px 0 24px',
      '&::before, &::after': {
        borderColor: 'rgba(0, 0, 0, 0.05)'
      }
    }}>
      <Typography 
        variant="caption" 
        sx={{ color: '#a0aec0' }}
      >
        Or continue with
      </Typography>
    </Divider>

    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      justifyContent: 'center' 
    }}>
      <Button
        variant="outlined"
        sx={{
          borderRadius: '8px',
          padding: '8px 16px',
          borderColor: '#e2e8f0',
          '&:hover': {
            borderColor: '#cbd5e0'
          }
        }}
      >
        <GoogleIcon sx={{ color: '#e53e3e' }} />
      </Button>
      <Button
        variant="outlined"
        sx={{
          borderRadius: '8px',
          padding: '8px 16px',
          borderColor: '#e2e8f0',
          '&:hover': {
            borderColor: '#cbd5e0'
          }
        }}
      >
        <GitHubIcon sx={{ color: '#2d3748' }} />
      </Button>
    </div>
  </Box>
</div>
  )
}

export default Login