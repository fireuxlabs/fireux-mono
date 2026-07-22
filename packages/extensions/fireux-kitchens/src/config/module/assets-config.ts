// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: publish package-owned showcase images through Nitro.
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

  const publicDir = resolver.resolve('./runtime/public')
  if (!existsSync(publicDir)) return

  type PublicAsset = string | { baseURL?: string; dir: string; maxAge?: number }
  const options = nuxt.options as typeof nuxt.options & {
    nitro?: { publicAssets?: PublicAsset[] }
  }
  const nitro = (options.nitro ||= {})
  const publicAssets = (nitro.publicAssets ||= [])
  const alreadyRegistered = publicAssets.some((entry) =>
    typeof entry === 'string' ? entry === publicDir : entry.dir === publicDir
  )
  if (!alreadyRegistered) publicAssets.push({ dir: publicDir })
}
