import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'

export const configurePublicAssets = (resolver: Resolver, nuxt: Nuxt) => {
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

  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
  const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
  const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
  if (!alreadyDev) {
    ecoDirs.push({ key: 'slap', title: 'Apps That Slap ecosystem images', dir: publicDir })
  }
}
