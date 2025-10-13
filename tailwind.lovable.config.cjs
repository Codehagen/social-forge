module.exports = {
  corePlugins: {
    preflight: false, // avoid double reset with v4
  },
  content: [
    "./app/(builder)/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/lovable/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/lovable/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/lovable/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/lovable/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    require("tailwind-gradient-mask-image"),
  ],
};
