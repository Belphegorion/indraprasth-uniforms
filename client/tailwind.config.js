/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Brand Structure: Navy Hierarchy
        navy: {
          950: 'var(--color-navy-900)',
          900: 'var(--color-navy-900)',
          800: 'var(--color-navy-800)',
          700: 'var(--color-navy-700)',
          600: 'var(--color-navy-700)',
          500: 'var(--color-blue-600)',
        },
        // Brand Primary: Royal Blue (Logo Wordmark)
        blue: {
          600: 'var(--color-blue-600)',
          100: 'var(--color-blue-100)',
          50: 'var(--color-blue-100)',
          500: 'var(--color-blue-600)',
        },
        // Brand Accent: Crimson (Logo Crown)
        crimson: {
          800: 'var(--color-crimson-800)',
          700: 'var(--color-crimson-700)',
          600: 'var(--color-crimson-600)',
          400: 'var(--color-crimson-400)',
          100: 'var(--color-crimson-100)',
        },
        // Surfaces: Warm Beige & Cream (~60% of canvas)
        cream: {
          50: 'var(--color-cream-50)',
          100: 'var(--color-cream-100)',
        },
        sand: {
          200: 'var(--color-sand-200)',
          300: 'var(--color-sand-300)',
        },
        taupe: {
          500: 'var(--color-taupe-500)',
        },
        // Antique Brass Accents
        brass: {
          DEFAULT: 'var(--color-brass)',
          text: 'var(--color-brass-text)',
        },
        // Typography Ink & Slate
        ink: 'var(--color-ink)',
        slate: {
          DEFAULT: 'var(--color-slate)',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: 'var(--color-slate)',
          600: 'var(--color-slate)',
          700: 'var(--color-ink)',
          800: 'var(--color-navy-800)',
          900: 'var(--color-navy-900)',
        },
        // Semantic Tokens
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
        },
        // Backward-compatible fallback mappings for previously generated tokens
        brand: {
          50: 'var(--color-blue-100)',
          100: 'var(--color-blue-100)',
          200: 'var(--color-sand-300)',
          300: 'var(--color-brass)',
          400: 'var(--color-blue-600)',
          500: 'var(--color-blue-600)',
          600: 'var(--color-navy-800)',
          700: 'var(--color-navy-700)',
          800: 'var(--color-navy-800)',
          900: 'var(--color-navy-900)',
          950: 'var(--color-navy-900)',
        },
        linen: {
          50: 'var(--color-cream-50)',
          100: 'var(--color-cream-100)',
          200: 'var(--color-sand-200)',
          300: 'var(--color-sand-300)',
          400: 'var(--color-taupe-500)',
          500: 'var(--color-taupe-500)',
        },
        charcoal: {
          900: 'var(--color-ink)',
          800: 'var(--color-ink)',
          700: 'var(--color-ink)',
          600: 'var(--color-slate)',
          500: 'var(--color-slate)',
          400: 'var(--color-taupe-500)',
        },
        gold: {
          50: 'var(--color-cream-50)',
          100: 'var(--color-sand-200)',
          200: 'var(--color-sand-300)',
          300: 'var(--color-brass)',
          400: 'var(--color-brass)',
          500: 'var(--color-brass)',
          600: 'var(--color-brass-text)',
          700: 'var(--color-brass-text)',
        },
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        plinth: 'var(--shadow-plinth)',
        'plinth-hover': 'var(--shadow-plinth-hover)',
        drawer: 'var(--shadow-drawer)',
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};
