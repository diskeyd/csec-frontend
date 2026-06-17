/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — TEAL (2026-06-17, replaces retired slate #566A8E "navy").
        // Desaturated professional teal on a cool light base; the old slate is
        // NOT deleted — it moves to `info` (analyzing / low-severity) below.
        'brand-primary': '#2F7A72',
        'brand-hover': '#245F58',
        'brand-soft': '#DCEEEB',

        // Neutral / surface — MODERNIZED (2026-06-17): warm beige base read "old".
        // Now a COOL, light, near-white base (Linear/Stripe-light). Token NAMES are
        // load-bearing (the :root var() bridge + inline JSX styles key off them) —
        // only VALUES change. `white` = clean card surface #FFFFFF; `bg-page` = a
        // hair-cool off-white #FBFBFC so cards lift off the canvas; depth via the
        // cool tonal steps below + the subtle shadow.
        black: '#16181D',
        white: '#FFFFFF',
        'text-strong': '#16181D',
        'text-default': '#3A3F46',
        'text-mute': '#6B7280',
        'text-faint': '#9AA1AC',
        // Cool light hairlines (were warm #D6D6D6/#E8E8E8). border = visible edge,
        // border-soft = inner dashed/hairline dividers.
        border: '#E4E6EB',
        'border-soft': '#EEF0F3',
        'bg-card': '#E2E7E4',
        'bg-page': '#FBFBFC',
        // Cool tonal layering steps (#FBFBFC → #F4F5F7 → #ECEEF1). `surface-1` =
        // resting sunken inner fill (table headers, search fields, evidence blocks,
        // tracks); `bg-sunken` = deeper inset; `bg-hover` = interactive hover step.
        'surface-1': '#F4F5F7',
        'bg-hover': '#F1F3F5',
        'bg-sunken': '#ECEEF1',

        // Semantic — success
        success: '#7BA672',
        'success-bg': '#DCEAA2',
        'success-soft': '#EEF5D8',
        'success-text': '#4d6b3f',

        // Semantic — danger
        danger: '#D8634F',
        'danger-bg': '#F4D5CD',
        'danger-soft': '#FBEAE6',
        'danger-text': '#9d4232',

        // Semantic — warning
        warning: '#CC9473',
        'warning-bg': '#EFD9C9',
        'warning-soft': '#F7E9DD',
        'warning-text': '#8a5a39',

        // Semantic — info = retired brand SLATE (was teal #68C7C1, which now
        // collided with the teal brand). Slate reads as a calm "analyzing /
        // low-severity / neutral-info" state, clearly distinct from teal accent.
        info: '#566A8E',
        'info-bg': '#D6DEEA',
        'info-soft': '#E8ECF3',
        'info-text': '#445975',

        // Accent
        'accent-lavender': '#9281CD',
        'accent-periwinkle': '#8C9ED9',
      },
      fontFamily: {
        kr: ['"Noto Sans KR"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        en: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      spacing: {
        's-1': '4px',
        's-2': '8px',
        's-3': '12px',
        's-4': '16px',
        's-6': '24px',
        's-8': '32px',
        's-12': '48px',
        's-16': '64px',
        's-24': '96px',
      },
      borderRadius: {
        // MODERN SOFT SCALE (2026-06-17): the prior flat 4px read sharp/old. Now a
        // graded scale by element size (Linear/Stripe-light feel). Capped at 10px —
        // 12px was rejected earlier as too bubbly. Small chips 6 → buttons/inputs 8
        // → cards/panels 10. Only 999px (pill/avatar/status-chip) is the exception.
        r: '6px',
        'r-md': '8px',
        'r-lg': '10px',
        'r-xl': '10px',
        pill: '999px',
      },
      boxShadow: {
        // Subtle BLACK shadow per plan (not tinted). Depth comes primarily from tonal
        // surface layering + these restrained black shadows — never from heavy contrast.
        'elev-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'elev-md': '0 1px 3px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)',
        'elev-lg': '0 4px 16px rgba(0,0,0,0.08)',
      },
      screens: {
        custom: '1000px',
      },
    },
  },
  plugins: [],
}
