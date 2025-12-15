import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'node:fs'

type PublicAssetEntry = string | { baseURL?: string; dir: string; maxAge?: number }

export function configureAssets(resolver: Resolver, nuxt: Nuxt) {
  const dir = resolver.resolve('./runtime/public')
  if (!existsSync(dir)) return

  const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
  const publicAssets = (nitro.publicAssets ||= []) as PublicAssetEntry[]

  const already = publicAssets.some((entry) =>
    typeof entry === 'string' ? entry === dir : entry?.dir === dir
  )
  if (!already) {
    publicAssets.push({ dir })
  }

  nuxt.hook('nitro:config', (nitroConfig) => {
    nitroConfig.alias ||= {}
    nitroConfig.alias['#fireux-misebox-public'] = dir
  })
}
