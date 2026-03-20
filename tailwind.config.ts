import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0ea5e9", // Medical Blue (sky-500)
          secondary: "#38bdf8", // Sky-400
        },
        surface: {
          900: "#f8fafc", // slate-50 (app background)
          800: "#ffffff", // white (card background)
          700: "#f1f5f9", // slate-100 (inputs)
          600: "#e2e8f0", // slate-200 (hover)
        },
      },
    },
  },
  plugins: [],
};
export default config;
