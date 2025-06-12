/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Include the root HTML file
    "./src/*/.{js,jsx,ts,tsx}", // Include all React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
