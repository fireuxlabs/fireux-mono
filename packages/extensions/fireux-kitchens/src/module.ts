// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: align Kitchen sitemap publication with canonical visibility.
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureRuntime } from './config/module/runtime-config'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import {
  registerComposablesDir,
  registerLayoutsDir,
} from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo'
import { configurePlugins } from './config/module/plugins-config'
import { configureComponents } from './config/module/components-config'
import { configurePages } from './config/module/pages-config'
import { configureAssets } from './config/module/assets-config'
import { configureServer } from './config/module/server-config'
import {
  registerFireuxConsole,
  registerFireuxMembershipCleanup,
} from 'fireux-core/config/module/runtime-config'

export interface ModuleOptions {
  prefix?: string
  defaultKitchenId?: string
  ensureTestKitchen?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxKitchens?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxKitchens?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-kitchens',
    version: '0.1.0',
    configKey: 'fireuxKitchens',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    prefix: 'Fire',
    defaultKitchenId: '',
    ensureTestKitchen: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    registerFireuxConsole(nuxt, {
      family: 'kitchen',
      rootCollection: 'kitchens',
      appSupportCollection: 'kitchens',
      supportsInlineNotes: true,
      appOnboarding: {
        label: 'Kitchen App',
        description: 'An App attached to one existing canonical Kitchen.',
        primaryEntity: 'required',
        rootOnboardingPath: '/kitchens/create',
      },
    })
    registerFireuxMembershipCleanup(nuxt, {
      collection: 'drivers',
      clearArrayFields: ['active_kitchen_ids'],
      deactivateArrayObjectFields: ['kitchen_links'],
    })
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolver.resolve('./runtime/types/pdf-worker.types.ts'),
      })
    })
    registerReservedRootRouteKeys([
      'menus',
      'kitchens',
      'chefs',
      'drivers',
      'ingredients',
    ])
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/kitchens')
      ctx.addHub('/chefs')
      ctx.addHub('/drivers')
      ctx.addHub('/ingredients')
      ctx.addStaticPath('/kitchens/learn-more')
      ctx.addStaticPath('/kitchens/learn-more/dev')
      ctx.addStaticPath('/chefs/learn-more')
    })
    nuxt.hook(
      'fireux:seo:sitemaps:extend' as any,
      (ctx: FireuxSeoSitemapsExtendContext) => {
        ctx.addDocument('/sitemaps/kitchens.xml')
      }
    )

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'kitchens', {
          enabled: true,
          defaultKitchenId: String(options.defaultKitchenId || '').trim(),
          ensureTestKitchen: options.ensureTestKitchen !== false,
        }),
      plugins: configurePlugins,
      composables: registerComposablesDir,
      components: configureComponents,
      layouts: registerLayoutsDir,
      pages: configurePages,
      assets: configureAssets,
      server: configureServer,
    })
  },
})
