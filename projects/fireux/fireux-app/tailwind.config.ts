import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    // FireUX core (workspace path)
    '../../../packages/core/fireux-core/src/**/*.{vue,js,ts}',
    // FireUX core when consumed from node_modules
    './node_modules/fireux-core/**/*.{vue,js,ts}',
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
