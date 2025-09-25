/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.{html,svg}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00704A',
          300: '#2BAE84',
          600: '#004d33'
        },
        accent: '#C9A35A',
        base: {
          100: '#F7F6F4',
          900: '#171717'
        },
        brown: {
          100: '#EEE6DE',
          200: '#DACBBD',
          600: '#6A543D',
          700: '#4B3A2A',
          800: '#3C2E22',
          900: '#2E2219'
        },
        gold: {
          50: '#FFF8E6',
          400: '#DDBC7A',
          600: '#C9A35A',
          700: '#B78F45'
        }
      },
      borderRadius: {
        xl: '1rem'
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.12)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/aspect-ratio')]
};


