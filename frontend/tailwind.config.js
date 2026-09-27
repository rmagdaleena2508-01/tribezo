/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "var(--night)",
        canopy: "var(--canopy)",
        leaf: "var(--leaf)",
        moss: "var(--moss)",
        bark: "var(--bark)",
        parchment: "var(--parchment)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        ember: "var(--ember)",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
