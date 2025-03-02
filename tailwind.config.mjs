// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        danger: "var(--danger)",
        ui: {
          background: "var(--ui-background)",
          "01": "var(--ui-01)",
          "02": "var(--ui-02)",
          "03": "var(--ui-03)",
          "04": "var(--ui-04)",
          "05": "var(--ui-05)",
        },
        text: {
          "01": "var(--text-01)",
          "02": "var(--text-02)",
          "03": "var(--text-03)",
        },
        interactive: {
          "01": "var(--interactive-01)",
          "02": "var(--interactive-02)",
          "03": "var(--interactive-03)",
          "04": "var(--interactive-04)",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
