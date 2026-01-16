// FILE: packages/ecosystem/fireux-fireux/src/module.ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'

import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { existsSync } from 'fs'
import { configureComponents } from './config/components-config'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
  },

  setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)
    const debug = !!process.env.FIREUX_DEBUG_ECOSYSTEM
    if (debug) {
      console.log(
        '[fireux-fireux/module] loaded ecosystemConfig.id',
        ecosystemConfig?.id
      )
      console.log(
        '[fireux-fireux/module] loaded ecosystemConfig.firebase',
        ecosystemConfig?.firebase
      )
    }

    // 🔎 Make the runtime write-shape explicit
    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    // 🔎 Confirm it actually landed where we expect
    const pub = (nuxt.options.runtimeConfig as any)?.public
    if (debug) {
      console.log(
        '[fireux-fireux/module] after setRuntimeFirebaseEcosystem public.firebaseEcosystem',
        pub?.firebaseEcosystem
      )
    }

    configureComponents(resolver, nuxt)

    // Serve runtime public assets via Nitro (so /img/ecosystem/* works)
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
        nitroConfig.alias['#fireux-fireux-public'] = publicDir
      })

      // Dev tooling: expose ecosystem public dirs for /dev/images scanning
      const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
      const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
      const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
      if (!alreadyDev) {
        ecoDirs.push({ key: 'fireux', title: 'FireUX ecosystem images', dir: publicDir })
      }
    }
  },
})

export default module