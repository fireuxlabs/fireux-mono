import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
  const menuDetailCss = resolver.resolve(
    './runtime/assets/styles/menu-detail.css'
  )
  if (!existsSync(menuDetailCss)) return

  nuxt.options.css = nuxt.options.css || []
  if (!nuxt.options.css.includes(menuDetailCss)) {
    nuxt.options.css.push(menuDetailCss)
  }

  const publicDir = resolver.resolve('./runtime/public')
  if (!existsSync(publicDir)) return

  const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
  const publicAssets = (nitro.publicAssets ||= []) as Array<
    string | { baseURL?: string; dir: string; maxAge?: number }
  >
  const already = publicAssets.some((entry) =>
    typeof entry === 'string' ? entry === publicDir : entry?.dir === publicDir
  )

  if (!already) publicAssets.push({ dir: publicDir })
}
