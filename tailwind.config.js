/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ Ativa dark mode com classe
  theme: {
    extend: {
      colors: {
        // 🎨 CORES DO OUTGO
        primary: {
          DEFAULT: '#FF6B35',    // Laranja principal do Outgo
          dark: '#E55A2B',       // Laranja mais escuro
          light: '#FF8557',      // Laranja mais claro
        },
        secondary: {
          DEFAULT: '#004E89',    // Azul escuro
          dark: '#003D6B',       // Azul ainda mais escuro
          light: '#0062A8',      // Azul mais claro
        },
        accent: {
          purple: '#6C63FF',     // Roxo/Lilás
          yellow: '#FFB627',     // Amarelo/Dourado
          green: '#00D9A3',      // Verde água
        },
        neutral: {
          dark: '#1A1A2E',       // Quase preto
          gray: '#6B7280',       // Cinza médio
          light: '#F3F4F6',      // Cinza bem claro
        },
        // 🌙 CORES DARK MODE
        dark: {
          bg: '#0F0F1E',         // Background principal (muito escuro)
          card: '#1A1A2E',       // Cards e containers
          surface: '#232338',    // Superfícies elevadas
          border: '#2D2D44',     // Bordas
          text: '#E5E5E5',       // Texto principal
          'text-muted': '#A0A0B8', // Texto secundário
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}