import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}
