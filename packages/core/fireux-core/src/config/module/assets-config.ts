import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
  const assetsDir = resolver.resolve('./runtime/assets')
  if (!existsSync(assetsDir)) return

  nuxt.options.alias = nuxt.options.alias || {}
  nuxt.options.alias['fireux-core/assets'] = assetsDir
}
