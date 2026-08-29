/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          subtle: "#F1F5F9",
          primary: "#2563EB",
          primaryLight: "#EFF6FF",
          teal: "#0F766E",
          text: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
          safe: "#16A34A",
          low: "#65A30D",
          suspicious: "#F59E0B",
          high: "#DC2626"
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
