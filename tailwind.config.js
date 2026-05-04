import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ── Brand design system tokens ── */
        brand: {
          navy:  "#152328",   /* dark teal-navy — primary brand */
          lime:  "#D9EA85",   /* lime yellow — accent */
          hover: "#1E353D",   /* navy hover state */
        },
        "pale-lime":   "#EAF2D7",  /* pale lime tint — secondary bg */
        "off-white":   "#F7F8F4",  /* page background */
        "light-gray":  "#F0F0EC",  /* input bg / disabled bg */
        "forest-green":"#3D6B2C",  /* links / progress / success tags */
        "body-text":   "#2C2C2A",  /* all body copy */
        "mid-gray":    "#444441",  /* subheadings / captions */
        "muted-gray":  "#B0AFA8",  /* disabled text / hints / dividers */
        /* Semantic status */
        "status-success": "#2E7D32",
        "status-warning": "#B45309",
        "status-error":   "#B91C1C",
        "status-info":    "#1565C0",
        /* Legacy aliases kept for backward compat */
        "pale-lime-legacy": "#dbe890",
        "dark-blue-grey":   "#152328",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["DM Sans", "Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [tailwindAnimate],
};
