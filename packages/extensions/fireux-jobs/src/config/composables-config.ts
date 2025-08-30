import { addImportsDir } from '@nuxt/kit'
export function configureComposables(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/composables'))
}
