// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors (customizable)
        primary: {
          50: '#f0f9ff',   // Very light blue
          100: '#e0f2fe',  // Light blue
          200: '#bae6fd',  // Lighter blue
          300: '#7dd3fc',  // Light blue
          400: '#38bdf8',  // Medium blue
          500: '#0ea5e9',  // Primary blue
          600: '#0284c7',  // Darker blue
          700: '#0369a1',  // Dark blue
          800: '#075985',  // Very dark blue
          900: '#0c4a6e',  // Darkest blue
          DEFAULT: '#0ea5e9',
        },

        // Secondary colors (gold/yellow accent)
        secondary: {
          50: '#fefce8',   // Very light yellow
          100: '#fef9c3',  // Light yellow
          200: '#fef08a',  // Lighter yellow
          300: '#fde047',  // Light yellow
          400: '#facc15',  // Medium yellow
          500: '#eab308',  // Primary yellow/gold
          600: '#ca8a04',  // Darker yellow
          700: '#a16207',  // Dark yellow
          800: '#854d0e',  // Very dark yellow
          900: '#713f12',  // Darkest yellow
          DEFAULT: '#eab308',
        },

        // Legacy colors (for backward compatibility)
        navy: {
          DEFAULT: '#075985', // Maps to primary-800
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        gold: {
          DEFAULT: '#eab308', // Maps to secondary-500
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a',
          300: '#fde047', 400: '#facc15', 500: '#eab308',
          600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12',
        },

        // Status colors
        success: '#10b981',  // Green
        warning: '#f59e0b',  // Orange
        error: '#ef4444',    // Red
        info: '#3b82f6',     // Blue

        // Exam-specific colors
        emerald: {
          exam: '#0D6B4E', 'exam-light': '#D1FAE5', 'exam-border': '#6EE7B7',
        },
        ruby: {
          exam: '#A81C3A', 'exam-light': '#FFE4E6', 'exam-border': '#FECDD3',
        },
      },

      fontFamily: {
        display: ['Calibri', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Calibri', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'system-ui', 'sans-serif'],
        body: ['Calibri', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '1.125rem',  // 18px (increased for better readability)
        'lg': '1.25rem',     // 20px
        'xl': '1.375rem',    // 22px
        '2xl': '1.625rem',   // 26px
        '3xl': '2rem',       // 32px
        '4xl': '2.5rem',     // 40px
        '5xl': '3.25rem',    // 52px
        '6xl': '4rem',       // 64px
      },

      spacing: {
        'header': '4rem',      // 64px
        'sidebar': '16rem',    // 256px
        'sidebar-collapsed': '4rem', // 64px
      },

      borderRadius: {
        'sm': '0.25rem',  // 4px
        'md': '0.375rem', // 6px
        'lg': '0.5rem',   // 8px
        'xl': '0.75rem',  // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        'full': '9999px'
      },

      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },

      keyframes: {
        slideUp: { 
          '0%': { opacity: 0, transform: 'translateY(16px)' }, 
          '100%': { opacity: 1, transform: 'translateY(0)' } 
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDot: { 
          '0%,100%': { opacity: 1 }, 
          '50%': { opacity: 0.4 } 
        },
        bounceSubtle: { 
          '0%,100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-4px)' } 
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      boxShadow: {
        'card': '0 2px 8px rgba(11,20,55,0.07)',
        'card-hover': '0 6px 24px rgba(11,20,55,0.12)',
        'gold': '0 8px 28px rgba(234,179,8,0.25)',
        'navy': '0 8px 28px rgba(7,89,133,0.35)',
        'brand': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'brand-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },

      // Custom gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0284c7, #38bdf8)',
        'gradient-secondary': 'linear-gradient(135deg, #ca8a04, #facc15)',
        'gradient-hero': 'linear-gradient(135deg, #0c4a6e, #0284c7)',
        'gradient-brand': 'linear-gradient(135deg, #075985, #0ea5e9)',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Brand-specific utilities
        '.text-brand-primary': {
          color: '#0ea5e9',
        },
        '.text-brand-secondary': {
          color: '#eab308',
        },
        '.bg-brand-primary': {
          backgroundColor: '#0ea5e9',
        },
        '.bg-brand-secondary': {
          backgroundColor: '#eab308',
        },
        
        // Custom button styles
        '.btn-brand': {
          backgroundColor: '#0ea5e9',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#0284c7',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
        
        // Custom card styles
        '.card-brand': {
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          padding: '1.5rem',
          border: '1px solid #e5e5e5',
        },
        
        // Institution-specific styles
        '.institution-header': {
          background: 'linear-gradient(135deg, #0c4a6e, #0284c7)',
          color: 'white',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
