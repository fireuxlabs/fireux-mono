// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: expose an explicit-import-only finance module.
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'fireux-finance',
    version: '0.1.0',
    configKey: 'fireuxFinance',
    compatibility: { nuxt: '^4.4.0' },
  },
})
