import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'primary': '#FCA653',
        'main-bg': '#F1F1F1'
      },
      boxShadow: {
        'card': '0px 10px 15px -6px rgba(0,0,0,0.77)'
      },
      gridTemplateColumns: {
        'main': '80px 1fr',
        'main-ex': '280px 1fr'
      }
    },
  },
  plugins: [],
};
export default config;
