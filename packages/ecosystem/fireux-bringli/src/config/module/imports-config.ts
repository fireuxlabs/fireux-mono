import { addImportsDir, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'

export const configureImports = (resolver: Resolver, _nuxt: Nuxt) => {
  const composablesDir = resolver.resolve('./runtime/composables')
  if (existsSync(composablesDir)) {
    addImportsDir(composablesDir)
  }
}
