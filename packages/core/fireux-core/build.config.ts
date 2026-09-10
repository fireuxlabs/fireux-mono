// Concurrent edit — 2026-07-20 23:46 CEST — Nuxt Package Toolchain Pass 2 of 3: build production config exports before package validation.
export default {
  hooks: {
    async 'mkdist:done'() {
      await import('./build/config.mjs')
    },
  },
}
