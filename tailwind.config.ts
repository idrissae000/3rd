import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090B10',
        indigoGlow: '#6D7DFF',
        neonMint: '#3CE2B4'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(109,125,255,0.2), 0 15px 35px rgba(109,125,255,0.2)'
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        fadeIn: 'fadeIn 0.45s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
