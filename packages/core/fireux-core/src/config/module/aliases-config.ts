import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync } from 'node:fs'

export function configureAliases(resolver: Resolver, nuxt: Nuxt) {
  const runtimeComposablesDir = resolver.resolve('./runtime/composables')
  if (existsSync(runtimeComposablesDir)) {
    nuxt.options.alias = nuxt.options.alias || {}
    nuxt.options.alias['#fireux-core-composables'] = runtimeComposablesDir
  }
}
