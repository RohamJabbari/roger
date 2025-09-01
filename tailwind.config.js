/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  safelist: [
    '-top-1.5',
    '-right-1.5',
    '-top-2.5',
    '-right-2.5',
  ],
  theme: {
    extend: {
      colors: {
        'roger-creme': '#f5f2ed'
      }
    },
  },
  plugins: [require('flowbite/plugin'), require('@tailwindcss/forms')],
}

