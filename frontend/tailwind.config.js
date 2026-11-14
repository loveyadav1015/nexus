export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':        '#1a1d21',
        'bg-sidebar':     '#19171d',
        'bg-main':        '#1d1c1d',
        'bg-surface':     '#222529',
        'bg-input':       '#2c2d30',
        'bg-hover':       '#27292d',
        'bg-active':      '#1164a3',
        'text-primary':   '#d1d2d3',
        'text-muted':     '#9b9da0',
        'text-faint':     '#6b7280',
        accent:           '#4a9eed',
        'accent-hover':   '#6ab0f5',
        'btn-primary':    '#4a55c8',
        'btn-hover':      '#5561d4',
        online:           '#2bac76',
        away:             '#e8a723',
        offline:          '#6b7280',
        border:           '#383a40',
        'border-light':   '#2c2d30',
        error:            '#e8502a',
      },
      fontFamily: {
        sans: ['Lato', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      width: {
        sidebar: '260px',
        panel: '320px',
        'dm-details': '288px',
      },
      height: {
        header: '56px',
      },
    },
  },
  plugins: [],
}
