import { addImportsDir, type Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver, _options?: any) {
  addImportsDir(resolver.resolve('./runtime/composables'))
  addImportsDir(resolver.resolve('./runtime/composables/**'))
}
