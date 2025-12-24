/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        agri: {
          black: "#020617",
          emerald: "#10b981",
          gold: "#fbbf24",
          neon: "#34d399"
        }
      }
    },
  },
  plugins: [],
}
