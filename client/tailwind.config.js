/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Lora', 'serif'],
      },
      colors: {
        // Primary — Warm terracotta / coral
        primary: {
          50:  '#fef4f0',
          100: '#fde6dd',
          200: '#fbc9b8',
          300: '#f8a68a',
          400: '#f4795a',
          500: '#e85d3a',   // Main brand
          600: '#d14425',
          700: '#ae351c',
          800: '#8c2d1c',
          900: '#73291c',
        },
        // Neutral — Deep charcoal palette
        charcoal: {
          50:  '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b8c1',
          400: '#91919e',
          500: '#737383',
          600: '#5d5d6b',
          700: '#4c4c57',
          800: '#41414a',
          900: '#393940',
          950: '#1a1a1f',   // Near-black for headings
        },
        // Accent — Sage green
        sage: {
          50:  '#f4f7f4',
          100: '#e4ece4',
          200: '#c9d9ca',
          300: '#a2bea4',
          400: '#769e79',
          500: '#568159',   // Main accent
          600: '#436845',
          700: '#365339',
          800: '#2d4430',
          900: '#263828',
          950: '#121e14',
        },
        // Highlight — Golden amber
        amber: {
          50:  '#fefbe8',
          100: '#fef6c3',
          200: '#feeb89',
          300: '#fdd846',
          400: '#fac515',
          500: '#eaae08',
          600: '#ca8704',
          700: '#a16107',
          800: '#854d0e',
          900: '#714012',
        },
        // Surface colors
        surface: {
          warm:   '#faf8f6',
          cream:  '#f5f0eb',
          mist:   '#f0ede8',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'linear-gradient(135deg, #fef4f0 0%, #f4f7f4 50%, #fefbe8 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
