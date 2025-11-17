import { createTheme } from '@mui/material/styles';

// Extend the Theme interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

// Regular Parking Mode Theme (Classic Mode)
export const parkingTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d4f87', // Deep Navy Blue
      light: '#2d5a9e',
      dark: '#0f2847',
    },
    secondary: {
      main: '#f9fcfe', // Bright Yellow
      light: '#f9fcfe',
      dark: '#f9fcfe',
    },
    accent: {
      main: '#F9C80E', // Yellow for text highlights
      light: '#fad646',
      dark: '#c79f0a',
    },
    background: {
      default: '#F4F5F7', // Light Gray
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Charcoal
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: [
      '"Jersey 25"',
      'cursive',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// EV Mode Theme (Electric Vehicle Mode)
export const evTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00B894', // Teal Green
      light: '#33c9a8',
      dark: '#008f74',
    },
    secondary: {
      main: '#434343ff', // Lime Electric
      light: '#605f5fff',
      dark: '#323030ff',
    },
    accent: {
      main: '#A3FF12', // Lime for text highlights
      light: '#b9ff4a',
      dark: '#82cc0e',
    },
    background: {
      default: '#ffffffff', // Dark Charcoal
      paper: '#9ecfc4ff',
    },
    text: {
      primary: '#121212', // White
      secondary: '#6f6f6fff',
    },
  },
  typography: {
    fontFamily: [
      '"Jersey 25"',
      'cursive',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Legacy theme export (defaults to parking theme)
export default parkingTheme;
