import { addImportsDir } from '@nuxt/kit'

export function configureModels(resolver: any, _nuxt: any) {
  // Allow importing model helpers/types from runtime/models/** (where it makes sense)
  addImportsDir(resolver.resolve('./runtime/models'))
}
