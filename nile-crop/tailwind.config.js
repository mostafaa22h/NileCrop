export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#16a34a",
          dark: "#14532d",
          surface: "#f0fdf4",
          text: "#1f2937"
        }
      },
      boxShadow: {
        glow: "0 24px 60px rgba(20, 83, 45, 0.18)"
      }
    }
  }
};
