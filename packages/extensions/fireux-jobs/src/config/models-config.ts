import { addImportsDir } from '@nuxt/kit'
export function configureModels(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/models'))
}
