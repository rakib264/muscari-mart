import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Enhanced responsive font sizes with line heights
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
        '8xl': ['6rem', { lineHeight: '1' }],          // 96px
        '9xl': ['8rem', { lineHeight: '1' }],          // 128px

        // Fluid typography using clamp
        'fluid-xs': 'clamp(0.75rem, 2vw, 0.875rem)',     // 12px -> 14px
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',      // 14px -> 16px
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',      // 16px -> 18px
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',   // 18px -> 20px
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',       // 20px -> 24px
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2rem)',         // 24px -> 32px
        'fluid-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',     // 30px -> 40px
        'fluid-4xl': 'clamp(2.25rem, 7vw, 3rem)',        // 36px -> 48px
        'fluid-5xl': 'clamp(2.5rem, 8vw, 4rem)',         // 40px -> 64px
        'fluid-6xl': 'clamp(3rem, 10vw, 5rem)',          // 48px -> 80px
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Primary color system - Deep Forest Green based (#2D5A3D) - FIXED VALUES
        primary: {
          DEFAULT: '#2D5A3D', // deep forest green - MAIN COLOR
          foreground: '#ffffff',
          50: '#f8fcf9',   // Very light forest green
          100: '#f0f8f3',  // Light forest green
          200: '#dcede3',  // Lighter forest green
          300: '#b9d6c4',  // Light-medium forest green
          400: '#86b39a',  // Medium forest green
          500: '#2D5A3D',  // Base forest green
          600: '#2D5A3D',  // deep forest green (default) - SAME AS MAIN
          700: '#244831',  // Dark forest green
          800: '#1b3625',  // Darker forest green
          900: '#122419',  // Darkest forest green
        },
        // Secondary color system - Metallic Gold based (#D4AF37) - FIXED VALUES
        secondary: {
          DEFAULT: '#D4AF37', // metallic gold - MAIN COLOR
          foreground: '#122419', // dark forest green text on gold
          50: '#fdfbf6',   // Very light gold
          100: '#fbf6ed',  // Light gold
          200: '#f7eddb',  // Lighter gold
          300: '#efdab7',  // Light-medium gold
          400: '#e3be7b',  // Medium gold
          500: '#D4AF37',  // Base gold
          600: '#D4AF37',  // metallic gold (default) - SAME AS MAIN
          700: '#bf9d31',  // Dark gold
          800: '#aa8c2c',  // Darker gold
          900: '#957a26',  // Darkest gold
        },
        // Supporting color system - Beige (#F5F5DC)
        beige: {
          DEFAULT: 'hsl(var(--beige-300))', // beige
          50: 'hsl(var(--beige-50))',   // Very light beige
          100: 'hsl(var(--beige-100))', // Light beige
          200: 'hsl(var(--beige-200))', // Lighter beige
          300: 'hsl(var(--beige-300))', // beige (default)
          400: 'hsl(var(--beige-400))', // Medium beige
          500: 'hsl(var(--beige-500))', // Darker beige
          600: 'hsl(var(--beige-600))', // Dark beige
          700: 'hsl(var(--beige-700))', // Darker beige
          800: 'hsl(var(--beige-800))', // Very dark beige
          900: 'hsl(var(--beige-900))', // Darkest beige
        },
        // Supporting color system - Sandy Brown (#F4A460)
        sandy: {
          DEFAULT: 'hsl(var(--sandy-300))', // sandy brown
          50: 'hsl(var(--sandy-50))',   // Very light sandy brown
          100: 'hsl(var(--sandy-100))', // Light sandy brown
          200: 'hsl(var(--sandy-200))', // Lighter sandy brown
          300: 'hsl(var(--sandy-300))', // sandy brown (default)
          400: 'hsl(var(--sandy-400))', // Medium sandy brown
          500: 'hsl(var(--sandy-500))', // Darker sandy brown
          600: 'hsl(var(--sandy-600))', // Dark sandy brown
          700: 'hsl(var(--sandy-700))', // Darker sandy brown
          800: 'hsl(var(--sandy-800))', // Very dark sandy brown
          900: 'hsl(var(--sandy-900))', // Darkest sandy brown
        },
        // Semantic colors
        destructive: {
          DEFAULT: '#ef4444', // rose-500
          foreground: '#ffffff',
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ef4444', // rose-500 (default)
          600: '#e11d48',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
          foreground: '#ffffff',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // emerald-500 (default)
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          foreground: '#ffffff',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // amber-500 (default)
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          foreground: '#ffffff',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // sky-500 (default)
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(37, 211, 102, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(37, 211, 102, 0.8), 0 0 30px rgba(37, 211, 102, 0.6)' },
        },
        'gentle-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
          },
          '50%': {
            transform: 'scale(1.02)',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)'
          },
        },
        'smooth-bounce': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gentle-pulse': 'gentle-pulse 3s ease-in-out infinite',
        'smooth-bounce': 'smooth-bounce 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
