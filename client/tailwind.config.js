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
          950: '#0A1F3A',
          900: '#0A1F3A',
          800: '#0E2747',
          700: '#14407A',
          600: '#14407A',
          500: '#1860A8',
        },
        // Brand Primary: Royal Blue (Logo Wordmark)
        blue: {
          600: '#1860A8',
          100: '#DCE8F5',
          50: '#DCE8F5',
          500: '#1860A8',
        },
        // Brand Accent: Crimson (Logo Crown)
        crimson: {
          800: '#7F1428',
          700: '#A51B33',
          600: '#C8233F',
          400: '#E5566D',
          100: '#F8DDE2',
        },
        // Surfaces: Warm Beige & Cream (~60% of canvas)
        cream: {
          50: '#FBF8F2',
          100: '#F7F2E8',
        },
        sand: {
          200: '#EDE3D2',
          300: '#DCCDB4',
        },
        taupe: {
          500: '#766650',
        },
        // Antique Brass Accents
        brass: {
          DEFAULT: '#A8863C',
          text: '#7A5F22',
        },
        // Typography Ink & Slate
        ink: '#1B2430',
        slate: {
          DEFAULT: '#5B6676',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#5B6676',
          600: '#475569',
          700: '#334155',
          800: '#0E2747',
          900: '#0A1F3A',
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
