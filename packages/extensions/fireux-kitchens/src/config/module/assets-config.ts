import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
  const menuDetailCss = resolver.resolve(
    './runtime/assets/styles/menu-detail.css'
  )
  if (existsSync(menuDetailCss)) {
    nuxt.options.css = nuxt.options.css || []
    if (!nuxt.options.css.includes(menuDetailCss)) {
      nuxt.options.css.push(menuDetailCss)
    }
  }
}
