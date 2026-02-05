import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { configurePages } from 'fireux-core/config/module/pages-config'
import { existsSync } from 'fs'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-cleanbox',
    version: '0.1.0',
    configKey: 'fireuxCleanbox',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    // Core and any extensions are provided by the app via createFireuxConfig

    // Preferred runtime shape (used by fireux-nuxtfire / nuxt-vuefire config)
    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    // Ecosystem defaults for feature modules (app can override later).
    const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
    const pub = (rc.public ||= {}) as Record<string, any>
    const fireux = (pub.fireux ||= {}) as Record<string, any>
    if (!fireux.products || typeof fireux.products !== 'object') {
      fireux.products = { enabled: true }
    }
    if (!fireux.blogs || typeof fireux.blogs !== 'object') {
      fireux.blogs = { enabled: true }
    }

    // Layer runtime pages/layouts/middleware
    configurePages(resolver, nuxt)

    configureComponents(resolver, nuxt)

    // Auto-import composables and models if present
    const composablesDir = resolver.resolve('./runtime/composables')
    if (existsSync(composablesDir)) {
      addImportsDir(composablesDir)
    }

    // NOTE: Do NOT auto-import models.
    // - It creates collisions for common type names (e.g. Pill/Cell/Profile)
    // - Models should be imported explicitly by consumers

    // Serve runtime public assets via Nitro
    const publicDir = resolver.resolve('./runtime/public')
    if (existsSync(publicDir)) {
      const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
      const publicAssets = (nitro.publicAssets ||= []) as Array<
        string | { baseURL?: string; dir: string; maxAge?: number }
      >

      const already = publicAssets.some((entry) =>
        typeof entry === 'string' ? entry === publicDir : entry?.dir === publicDir
      )
      if (!already) publicAssets.push({ dir: publicDir })

      nuxt.hook('nitro:config', (nitroConfig: any) => {
        nitroConfig.alias ||= {}
        nitroConfig.alias['#fireux-cleanbox-public'] = publicDir
      })

      // Dev tooling: expose ecosystem public dirs for /dev/images scanning
      const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
      const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
      const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
      if (!alreadyDev) {
        ecoDirs.push({ key: 'cleanbox', title: 'Cleanbox ecosystem images', dir: publicDir })
      }
    }

    nuxt.hook('ready', () => {
      console.log('fireux-cleanbox: module configured')
    })
  },
})

export default module
