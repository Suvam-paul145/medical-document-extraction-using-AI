/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical professional palette
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#051e3e',
        },
        // Clinical teal
        teal: {
          50: '#f0fdfa',
          100: '#d4fdf5',
          200: '#a8f0ed',
          300: '#6feae3',
          400: '#38d8ce',
          500: '#13c4b6',
          600: '#0d9e8e',
          700: '#0e7c74',
          800: '#0f625f',
          900: '#0d4a4a',
        },
        // Health green
        health: {
          50: '#f0fdf4',
          100: '#dcfce7',
          300: '#86efac',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Alert colors
        alert: {
          warning: '#f59e0b',
          error: '#ef4444',
          critical: '#dc2626',
        },
        // Professional grays
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#334155',
            fontSize: '1rem',
            lineHeight: '1.625',
            fontFamily: '"Inter", system-ui, sans-serif',
          },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-medical': 'pulseMedical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1.5s infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseMedical: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(13, 158, 142, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(13, 158, 142, 0.4)' },
        }
      },
      boxShadow: {
        'medical': '0 4px 20px rgba(13, 158, 142, 0.15)',
        'medical-lg': '0 8px 32px rgba(13, 158, 142, 0.2)',
        'medical-sm': '0 2px 8px rgba(13, 158, 142, 0.1)',
      }
    },
  },
  plugins: [],
}
