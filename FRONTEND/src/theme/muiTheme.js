import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6444e6',
      light: '#8866ff',
      dark: '#5230c0',
    },
    secondary: {
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    h1: { color: '#212121' },
    h2: { color: '#212121' },
    h3: { color: '#212121' },
    h4: { color: '#212121' },
    h5: { color: '#212121' },
    h6: { color: '#212121' },
    body1: { color: '#212121' },
    body2: { color: '#666666' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#212121',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          color: '#212121',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#212121',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8866ff',
      light: '#bb86fc',
      dark: '#6444e6',
    },
    secondary: {
      main: '#03dac6',
      light: '#66fff9',
      dark: '#03dac6',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#558b2f',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffe082',
      dark: '#f57f17',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
    },
    info: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
    divider: '#333333',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    h1: { color: '#ffffff' },
    h2: { color: '#ffffff' },
    h3: { color: '#ffffff' },
    h4: { color: '#ffffff' },
    h5: { color: '#ffffff' },
    h6: { color: '#ffffff' },
    body1: { color: '#ffffff' },
    body2: { color: '#b0b0b0' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#262626',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#6444e6',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#7d5ae6',
          },
        },
        outlined: {
          borderColor: '#444444',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
            borderColor: '#666666',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            '& fieldset': {
              borderColor: '#444444',
            },
            '&:hover fieldset': {
              borderColor: '#666666',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#999999',
            opacity: 0.7,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        },
      },
    },
  },
});
