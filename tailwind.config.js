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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        bounce: "bounce 1.5s infinite ease-in-out",
        'toast-float': 'toast-float 2s ease-in-out forwards'
      },
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)", opacity: 1 },
          "50%": { transform: "translateY(-15px)", opacity: 0.8 },
        },
        'toast-float': {
          '0%': { 
            transform: 'translate(-50%, 20px)',
            opacity: '0'
          },
          '10%': {
            transform: 'translate(-50%, -50%)',
            opacity: '1'
          },
          '90%': {
            transform: 'translate(-50%, -50%)',
            opacity: '1'
          },
          '100%': {
            transform: 'translate(-50%, -100px)',
            opacity: '0'
          }
        }
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".animation-delay-200": {
          animationDelay: "0.2s",
        },
        ".animation-delay-400": {
          animationDelay: "0.4s",
        },
      });
    },
  ],
};
