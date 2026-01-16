import {
    addComponentsDir,
    addImportsDir,
    createResolver,
    defineNuxtModule,
} from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { configurePages } from 'fireux-core/config/module/pages-config'
import { existsSync } from 'fs'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    // Core and any extensions are provided by the app via createFireuxConfig

    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
    const pub = (rc.public ||= {}) as Record<string, any>
    const fireux = (pub.fireux ||= {}) as Record<string, any>
    const currentPlaces = fireux.places
    const miseboxPlacesDefaults = {
      enabled: true,
      types: ['kitchen', 'company'],
      googleAutocompleteTypeFilters: {
        kitchen: ['restaurant', 'cafe', 'food_truck'],
      },
    }

    fireux.places = currentPlaces && typeof currentPlaces === 'object'
      ? { ...miseboxPlacesDefaults, ...currentPlaces }
      : { ...miseboxPlacesDefaults }

    // Layer runtime pages/layouts/middleware
    configurePages(resolver, nuxt)

    nuxt.hook('pages:extend', (pages: any[]) => {
      for (let i = pages.length - 1; i >= 0; i -= 1) {
        const page = pages[i]
        const file = typeof page?.file === 'string' ? page.file : ''
        if (file.includes('/fireux-misebox/src/runtime/pages/companies')) {
          pages.splice(i, 1)
        }
      }
    })

    // Register runtime components WITHOUT a prefix
    const componentsDir = resolver.resolve('./runtime/components')
    if (existsSync(componentsDir)) {
      ;(nuxt.options.alias ||= {}) as Record<string, string>
      ;(nuxt.options.alias as Record<string, string>)['#fireux-misebox-components'] =
        componentsDir

      addComponentsDir({
        path: componentsDir,
        pattern: '**/*.vue',
        global: false,
        // Keep path segments in component names to avoid collisions
        // e.g. organisms/objects/Ingredient/Profile.vue -> OrganismsObjectsIngredientProfile
        pathPrefix: true,
        // Ensure ecosystem components override core defaults
        priority: 1,
      })
    }

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
    }

    // Dev tooling: expose ecosystem public dirs for /dev/images scanning
    const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
    const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
    const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
    if (!alreadyDev) {
      ecoDirs.push({ key: 'misebox', title: 'Misebox ecosystem images', dir: publicDir })
    }

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[fireux-misebox] layers', (nuxt.options as any)._layers)
      }
      // fireux-misebox: module configured
    })
  },
})

export default module
