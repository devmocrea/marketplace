/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Afristore brand palette — updated to match exact guidelines
        primary: {
          DEFAULT: "#E27D60", // Vibrant Terracotta
          light: "#F49D76",
          dark: "#B62710",
        },
        secondary: {
          DEFAULT: "#85DCBA", // Soft Mint Green
          light: "#B0EACB",
          dark: "#178758",
        },
        bg: {
          light: "#F8F9FA",
          dark: "#1E1E24",
        },
        text: {
          primary: "#212529",
          secondary: "#6C757D",
        },
        brand: {
          50: "#fdf6ee",
          100: "#faecd9",
          200: "#f4d5ae",
          300: "#ecb878",
          400: "#e49440",
          500: "#de7a1e", // primary orange
          600: "#cf6015",
          700: "#ac4914",
          800: "#8a3a17",
          900: "#713116",
          950: "#3d1608",
        },
        earth: {
          light: "#c9a96e",
          DEFAULT: "#8b6914",
          dark: "#4b3510",
        },
        // Terracotta palette
        terracotta: {
          50: "#fef3ee",
          100: "#fce4d6",
          200: "#f8c5ab",
          300: "#f49d76",
          400: "#ef6d3e",
          500: "#eb4f1b", // primary terracotta
          600: "#dc3611",
          700: "#b62710",
          800: "#912116",
          900: "#761e15",
          950: "#400c09",
        },
        // Mint palette
        mint: {
          50: "#eefbf4",
          100: "#d6f5e3",
          200: "#b0eacb",
          300: "#7dd9ac",
          400: "#48c189",
          500: "#26a76e", // primary mint
          600: "#178758",
          700: "#136c49",
          800: "#12563c",
          900: "#104733",
          950: "#07281d",
        },
        // Deep background tones
        midnight: {
          50: "#f5f3f0",
          100: "#e8e3db",
          200: "#d3c9b8",
          300: "#b9a88e",
          400: "#a48c6d",
          500: "#95795b",
          600: "#86664d",
          700: "#6d5141",
          800: "#5c443a",
          900: "#1a1108",
          950: "#0d0904",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.7s ease-out forwards",
        "fade-in-right": "fadeInRight 0.7s ease-out forwards",
        "scale-in": "scaleIn 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(222, 122, 30, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(222, 122, 30, 0.5)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "african-gradient":
          "linear-gradient(135deg, #3d1608 0%, #713116 25%, #8a3a17 50%, #de7a1e 100%)",
        "hero-gradient":
          "linear-gradient(180deg, rgba(26,17,8,0.92) 0%, rgba(26,17,8,0.7) 40%, rgba(26,17,8,0.85) 100%)",
        "card-gradient":
          "linear-gradient(180deg, transparent 0%, rgba(26,17,8,0.9) 100%)",
        "mint-gradient": "linear-gradient(135deg, #26a76e 0%, #178758 100%)",
        "terracotta-gradient":
          "linear-gradient(135deg, #eb4f1b 0%, #dc3611 100%)",
        "warm-gradient":
          "linear-gradient(135deg, #de7a1e 0%, #eb4f1b 50%, #dc3611 100%)",
      },
    },
  },
  plugins: [],
};
