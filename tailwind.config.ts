import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Canonical brand palette (Section 3.1)
        primary: '#245C3A',
        'on-primary': '#FFFFFF',
        'primary-container': '#D6EAD9',
        'on-primary-container': '#10331E',
        secondary: '#8BBF67',
        'on-secondary': '#132609',
        'secondary-container': '#E1F2D3',
        'on-secondary-container': '#19340B',
        tertiary: '#E7A94B',
        'on-tertiary': '#2B1B03',
        'tertiary-container': '#FBE8C6',
        'on-tertiary-container': '#3A2404',
        cream: '#F5F2E8',
        alert: '#D96B50',
        ink: '#1C241E',

        // Material-style neutral surface tokens from DESIGN.md
        surface: '#fcf9ef',
        'surface-dim': '#dedacb',
        'surface-bright': '#fcf9ef',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3e7',
        'surface-container': '#f0ede0',
        'surface-container-high': '#ebe7db',
        'surface-container-highest': '#e5e2d5',
        'on-surface': '#1c1c16',
        'on-surface-variant': '#414942',
        outline: '#717971',
        'outline-variant': '#c0c9bf',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#410002',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans Bengali"', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(36, 92, 58, 0.06)',
        'card-hover': '0 10px 24px rgba(36, 92, 58, 0.10)',
        drawer: '0 -6px 24px rgba(28, 36, 30, 0.10)',
      },
      borderRadius: {
        btn: '8px',
        card: '16px',
        modal: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
