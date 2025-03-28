import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        notion: {
          gray: {
            50: '#f7f7f7',
            100: '#f1f1f1',
            200: '#e6e6e6',
            300: '#d9d9d9',
            400: '#999999',
            500: '#666666',
            600: '#333333',
            700: '#1f1f1f',
            800: '#141414',
            900: '#0a0a0a',
          },
          blue: {
            50: '#e6f7ff',
            100: '#bae7ff',
            200: '#91d5ff',
            300: '#69c0ff',
            400: '#40a9ff',
            500: '#1890ff',
            600: '#0960d7',
            700: '#004ba0',
            800: '#003a80',
            900: '#002766',
          },
        },
      },
      boxShadow: {
        'notion': '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'notion': '0.375rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
