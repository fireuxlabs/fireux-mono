/**
 * Temporary shim for Nuxt macros until the language server exposes them in packages.
 * Remove once `definePageMeta` resolves without manual declaration.
 */
import type { PageMeta } from 'nuxt/dist/pages/runtime/composables'

declare global {
  const definePageMeta: (meta: PageMeta) => void
}

export {}
