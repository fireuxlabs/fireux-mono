import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  configureRuntime,
  configureOrdering,
} from './config/module/runtime-config.ts'
import type { OrderingConfiguration } from './types/ordering.ts'
import {
  registerComposablesDirs,
  registerLayoutComponents,
} from 'fireux-core/config/module/module-helpers'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'
import type {
  FireuxSeoExtendContext,
  FireuxSeoSitemapsExtendContext,
} from 'fireux-core/config/app/seo-config'
import { configureComponents } from './config/module/components-config.ts'
import { configurePages } from './config/module/pages-config.ts'
import { configureAssets } from './config/module/assets-config.ts'

export interface ModuleOptions {
  prefix?: string
  defaultKitchenId?: string
  ordering?: OrderingConfiguration
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
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    configureOrdering(nuxt, options.ordering)
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({
        path: resolver.resolve('./runtime/menu/models/pdf-worker.d.ts'),
      })
      references.push({ path: resolver.resolve('./types/runtime-config.d.ts') })
    })
    registerReservedRootRouteKeys(nuxt, [
      'menus',
      'order',
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

    configureRuntime(nuxt, 'kitchens', {
      enabled: true,
      defaultKitchenId: String(options.defaultKitchenId || '').trim(),
    })
    registerComposablesDirs(resolver, [
      './runtime/ingredient/composables',
      './runtime/kitchen/composables',
      './runtime/menu/composables',
      './runtime/user/composables',
    ])
    addImports({
      name: 'useOrderExchange',
      from: resolver.resolve(
        './runtime/kitchen/composables/orders/useOrderExchange'
      ),
    })
    for (const name of [
      'useKitchenOfferingCollection',
      'useKitchenOfferingNow',
    ]) {
      addImports({
        name,
        from: resolver.resolve(
          `./runtime/kitchen/composables/services/${name}`
        ),
      })
    }
    // Public Workspace entrypoints only; internal constructors and keys stay private.
    for (const [name, path] of [
      ['useKitchenWorkspaceMenu', 'menu/index'],
      ['useKitchenWorkspaceMenuOverview', 'menu/overview'],
      ['useKitchenWorkspaceMenuAi', 'menu/ai'],
      ['useKitchenWorkspaceMenuServices', 'menu/services'],
      ['useKitchenWorkspacePrep', 'prep/index'],

      ['useKitchenWorkspacePrepLibrary', 'prep/library'],
    ] as const) {
      addImports({
        name,
        from: resolver.resolve(
          `./runtime/kitchen/composables/workspace/${path}`
        ),
      })
    }
    configureComponents(resolver)
    registerLayoutComponents(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureAssets(resolver, nuxt)
  },
})
