import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cork: "var(--color-cork)",
        lime: "var(--color-lime)",
        "lime-dark": "var(--color-lime-dark)",
        panel: "var(--color-panel)",
        "data-green": "var(--color-data)",
        pin: "var(--color-pin)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
    },
  },
  plugins: [],
};
export default config;
