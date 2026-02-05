import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
                float: "float 3s ease-in-out infinite",
                glow: "glow 2s ease-in-out infinite",
                "pulse-slow": "pulse-slow 3s ease-in-out infinite",
                confetti: "confetti 3s ease-out forwards",
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                glow: "0 0 20px rgba(102, 126, 234, 0.5)",
                "glow-lg": "0 0 40px rgba(102, 126, 234, 0.8)",
            },
        },
    },
    plugins: [],
} satisfies Config;
