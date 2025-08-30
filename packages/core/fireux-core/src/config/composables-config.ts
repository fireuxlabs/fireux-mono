import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables/**
  addImportsDir(resolver.resolve('../runtime/composables'))
}
