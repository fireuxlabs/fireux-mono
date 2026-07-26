import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
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

  if (!alreadyRegistered) {
    publicAssets.push({ dir: publicDir, maxAge: 60 * 60 * 24 * 30 })
  }
}
