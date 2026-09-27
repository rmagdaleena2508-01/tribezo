/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "var(--night)",
        cocoa: "var(--cocoa)",
        sash: "var(--sash)",
        mustard: "var(--mustard)",
        canopy: "var(--canopy)",
        leaf: "var(--leaf)",
        moss: "var(--moss)",
        bark: "var(--bark)",
        parchment: "var(--parchment)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        ember: "var(--ember)",
      },
      // Fredoka: chunky and rounded, like the clay characters. For titles.
      // Nunito: rounded and very easy to read. For dialogue and buttons.
      fontFamily: {
        display: ["Fredoka", "Nunito", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      screens: {
        // Short screens, like a phone held sideways.
        short: { raw: "(max-height: 500px)" },
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
