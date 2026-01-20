import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6444e6',
      light: '#8866ff',
      dark: '#4c32b3',
    },
    secondary: {
      main: '#03dac6',
      light: '#66fff9',
      dark: '#00897b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    h1: { color: '#0f172a' },
    h2: { color: '#0f172a' },
    h3: { color: '#0f172a' },
    h4: { color: '#0f172a' },
    h5: { color: '#0f172a' },
    h6: { color: '#0f172a' },
    body1: { color: '#1e293b' },
    body2: { color: '#475569' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#6444e6',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(100, 68, 230, 0.3)',
          '&:hover': {
            backgroundColor: '#7d5ae6',
            boxShadow: '0 10px 15px -3px rgba(100, 68, 230, 0.4)',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#6444e6',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            borderColor: '#6444e6',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#1e293b',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6444e6',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#94a3b8',
            opacity: 1,
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#6444e6',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#1e293b',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#0f172a',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9977ff',
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
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#c0c0c0',
      disabled: '#707070',
    },
    divider: '#2a2a2a',
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
          backgroundColor: '#0d0d0d',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
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
          borderColor: '#333333',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1f1f1f',
            borderColor: '#555555',
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
              borderColor: '#333333',
            },
            '&:hover fieldset': {
              borderColor: '#555555',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#888888',
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
          backgroundColor: '#0d0d0d',
          color: '#ffffff',
        },
      },
    },
  },
});
