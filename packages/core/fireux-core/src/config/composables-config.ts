import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables (root and nested)
  addImportsDir([
    resolver.resolve('./runtime/composables'),
    resolver.resolve('./runtime/composables/**'),
    // Also export utility helpers for auto-import
    resolver.resolve('./runtime/utils'),
    resolver.resolve('./runtime/utils/**'),
  ])
}
