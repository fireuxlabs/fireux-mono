import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables (root and nested)
  addImportsDir([
    resolver.resolve('./runtime/composables'),
    resolver.resolve('./runtime/composables/**'),
  ])
}
