import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
        extend: {
                screens: {
                        'xs': '320px',
                        'sm': '480px',
                        'md': '640px',
                        'lg': '1024px',
                        'xl': '1280px',
                        '2xl': '1536px',
                        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
                        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
                        'landscape': { 'raw': '(orientation: landscape)' },
                        'portrait': { 'raw': '(orientation: portrait)' },
                },
                borderRadius: {
                        lg: '.5625rem',
                        md: '.375rem',
                        sm: '.1875rem'
                },
                colors: {
                        background: 'hsl(var(--background) / <alpha-value>)',
                        foreground: 'hsl(var(--foreground) / <alpha-value>)',
                        border: 'hsl(var(--border) / <alpha-value>)',
                        input: 'hsl(var(--input) / <alpha-value>)',
                        card: {
                                DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                                foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                                border: 'hsl(var(--card-border) / <alpha-value>)'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                                foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
                                border: 'hsl(var(--popover-border) / <alpha-value>)'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                                foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                                foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                                foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                                foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                                foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
                        },
                        ring: 'hsl(var(--ring) / <alpha-value>)',
                        radius: 'var(--radius)',
                },
                fontFamily: {
                        sans: ['var(--font-sans)', 'Tajawal', 'sans-serif'],
                        display: ['var(--font-display)', 'Cairo', 'sans-serif'],
                },
        }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
