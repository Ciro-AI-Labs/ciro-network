import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Galactic Color Palette
        'space-black': '#0a0a0f',
        'cosmic-dark': '#1a1a2e',
        'nebula-purple': '#16213e',
        'void-blue': '#0f3460',
        'star-white': '#ffffff',
        'cosmic-cyan': '#00ffff',
        'nebula-pink': '#ff69b4',
        'aurora-green': '#00ff88',
        'cosmic-orange': '#ff6b35',
        'stellar-yellow': '#ffd700',
      },
      animation: {
        'fractal-pulse': 'fractal-pulse 4s ease-in-out infinite',
        'cosmic-float': 'cosmic-float 6s ease-in-out infinite',
        'starfield': 'starfield 20s linear infinite',
        'grid-move': 'grid-move 15s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'stellar-shift': 'stellar-shift 4s ease infinite',
        'emoji-bounce': 'emoji-bounce 2s ease-in-out infinite',
        'particle-float': 'particle-float 8s linear infinite',
      },
      keyframes: {
        'fractal-pulse': {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '0.8'
          },
          '50%': { 
            transform: 'scale(1.1) rotate(180deg)',
            opacity: '1'
          }
        },
        'cosmic-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(10px) rotate(240deg)' }
        },
        'starfield': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' }
        },
        'grid-move': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'stellar-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'emoji-bounce': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' }
        },
        'particle-float': {
          '0%': {
            transform: 'translateY(100vh) rotate(0deg)',
            opacity: '0'
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateY(-100px) rotate(360deg)',
            opacity: '0'
          }
        }
      },
      backgroundImage: {
        'fractal-gradient': 'linear-gradient(135deg, #00ffff 0%, #ff69b4 50%, #00ff88 100%)',
        'cosmic-gradient': 'linear-gradient(45deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
        'stellar-gradient': 'linear-gradient(90deg, #ffd700 0%, #ff6b35 50%, #ff69b4 100%)',
        'math-grid': 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'space': '0 8px 32px rgba(0, 255, 255, 0.1)',
        'cosmic': '0 0 20px rgba(255, 105, 180, 0.3)',
        'stellar': '0 0 30px rgba(255, 215, 0, 0.4)',
      }
    },
  },
  plugins: [],
}

export default config 