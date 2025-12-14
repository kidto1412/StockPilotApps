/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        base: '#0F2215',
        surface: '#111827',
        border: '#1F2937',

        primary: '#22C55E',
        primaryDark: '#16A34A',

        textPrimary: '#E5E7EB',
        textSecondary: '#9CA3AF',
      },
    },
  },
  plugins: [],
};
