module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        vive: {
          primary: '#0ea5a4',      /* teal */
          'primary-content': '#ffffff',
          secondary: '#f59e0b',    /* amber */
          accent: '#7c3aed',       /* violet */
          neutral: '#111827',      /* gray-900 */
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#f97316',
          error: '#ef4444',
        },
      },
      'dark',
      'light',
    ],
  },
};
