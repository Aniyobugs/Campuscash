// CustomAppBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ background: '#6444e6' }}>
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
        <Toolbar disableGutters sx={{ width: '100%', px: 0 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            Campus Cash
          </Typography>
          {['How It Works', 'Rewards', 'Why Us', 'Testimonials'].map((label) => (
            <Button key={label} color="inherit" sx={{ mx: 1, textTransform: 'none' }}>
              {label}
            </Button>
            
        ))}
           <Button><Link to={'/L'} style={{textDecoration:'none',color:'white'}}>LOGIN</Link></Button>
          <Button
            variant="contained"
            color="success"
            // sx={{ ml: 2, borderRadius: 20, textTransform: 'none', fontWeight: 'bold', px: 3, py: 1 }}
          >
            <Link to={'/s'} 
            variant="contained"
            color="success"
            style={{ml: 2, borderRadius: 20, textTransform: 'none', fontWeight: 'bold', px: 3, py: 1 ,color:"white"}}>Get Started</Link>
            
        </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
