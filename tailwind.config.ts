import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2C332D",
        line: "#D1DBD1",
        sage: {
          50: "#F4F7F4",
          100: "#E9EEE9",
          200: "#D1DBD1",
          300: "#B9C8B9",
          400: "#A1B5A1",
          500: "#8BA88E",
          600: "#6F8A72",
          700: "#4B5E50",
          800: "#3A4A3E",
          900: "#2C332D",
        },
        brand: "#4B5E50",
        accent: "#8BA88E"
      }
    }
  },
  plugins: []
};

export default config;
