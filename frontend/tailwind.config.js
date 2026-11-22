export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        sidebar: 'var(--bg-sidebar)',
        surface: 'var(--bg-surface)',
        'surface-hover': 'var(--bg-surface-hover)',
        input: 'var(--bg-input)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'ink-primary': 'var(--text-primary)',
        'ink-secondary': 'var(--text-secondary)',
        'ink-faint': 'var(--text-faint)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-faint': 'var(--accent-faint)',
        'accent-border': 'var(--accent-border)',
        'status-online': 'var(--status-online)',
        'status-away': 'var(--status-away)',
        'status-offline': 'var(--status-offline)',
        'badge-bg': 'var(--badge-bg)',
        'badge-text': 'var(--badge-text)',
        'badge-border': 'var(--badge-border)',
        danger: 'var(--error)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace']
      },
      width: {
        sidebar: '264px',
        panel: '340px',
        'dm-details': '290px'
      },
      height: {
        header: '48px'
      }
    }
  },
  plugins: []
};
