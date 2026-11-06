// Derivado de leandroloffi/CustodyChain (2024); modificado por Lucas Barros Mota (2026)
// Toda cor vem de variáveis CSS definidas em src/app.css (:root e .dark).
// Os canais RGB separados permitem modificadores de opacidade (bg-primary/10).
const token = (nome) => `rgb(var(--${nome}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,svelte}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2') },
        border: token('border'),
        'border-strong': token('border-strong'),
        text: token('text'),
        chrome: { DEFAULT: token('chrome'), fg: token('chrome-fg') },
        muted: token('text-muted'),
        primary: { DEFAULT: token('primary'), fg: token('primary-fg') },
        success: token('success'),
        warning: token('warning'),
        danger: { DEFAULT: token('danger'), fg: token('danger-fg') },
        info: token('info'),
        simulated: token('simulated'),
      },
      borderColor: { DEFAULT: token('border') },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Segoe UI', 'Arial', 'Helvetica', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: { sm: 'none', md: 'none' }, // visual plano: sem sombras decorativas
      borderRadius: { DEFAULT: '2px', sm: '2px', md: '2px', lg: '3px', xl: '4px', '2xl': '4px', full: '3px' },
    },
  },
  plugins: [],
};
