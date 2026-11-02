/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          900: '#134e4a',
        },
        status: {
          greenBg: '#ecfdf5',
          greenText: '#065f46',
          greenBorder: '#a7f3d0',
          amberBg: '#fffbeb',
          amberText: '#92400e',
          amberBorder: '#fde68a',
          redBg: '#fef2f2',
          redText: '#991b1b',
          redBorder: '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
