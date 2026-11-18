/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05060d',
        midnight: '#0a0f24',
        violet: { DEFAULT: '#8b5cf6', glow: '#a78bfa' },
        cyan: { DEFAULT: '#22d3ee' },
        ember: '#fb923c',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        scroll: { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(14px)', opacity: '0' } },
      },
      animation: { float: 'float 6s ease-in-out infinite', scroll: 'scroll 1.6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
