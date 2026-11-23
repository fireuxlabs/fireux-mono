// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: align Kitchen sitemap publication with canonical visibility.
import {
  addImports,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  getLayerDirectories,
} from '@nuxt/kit'
import {
  configureRuntime,
  configureOrdering,
} from './config/module/runtime-config.ts'
import type { OrderingConfiguration } from './types/ordering.ts'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
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
  workspaceOnly?: boolean
  workspaceItems?: boolean
  workspaceMenus?: boolean
  publicMenus?: boolean
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
    if (options.workspaceItems && !options.workspaceOnly) {
      throw new Error(
        '[fireux-kitchens] workspaceItems requires workspaceOnly.'
      )
    }
    if (options.workspaceMenus && !options.workspaceItems) {
      throw new Error(
        '[fireux-kitchens] workspaceMenus requires workspaceItems.'
      )
    }
    if (options.publicMenus && !options.workspaceMenus) {
      throw new Error('[fireux-kitchens] publicMenus requires workspaceMenus.')
    }
    if (options.workspaceOnly) {
      if (
        options.ordering ||
        getLayerDirectories(nuxt).some(
          (layer) => layer.root === resolver.resolve('./runtime')
        )
      ) {
        throw new Error(
          '[fireux-kitchens] workspaceOnly cannot use the full Kitchens layer or ordering.'
        )
      }
      configureRuntime(nuxt, 'kitchens')
      nuxt.options.runtimeConfig.kitchensWorkspaceOnly = true
      extendPages((pages) => {
        pages.push({
          name: 'workspace-kitchen',
          path: '/workspace/kitchen',
          file: resolver.resolve('./runtime/kitchen/pages/workspace.vue'),
        })
        if (options.workspaceItems) {
          pages.push({
            name: 'workspace-kitchen-items',
            path: '/workspace/kitchen/items/:dishId?',
            file: resolver.resolve('./runtime/kitchen/pages/items.vue'),
          })
        }
        if (options.workspaceMenus) {
          pages.push({
            name: 'workspace-kitchen-menus',
            path: '/workspace/kitchen/menus/:menuSlug?',
            file: resolver.resolve('./runtime/kitchen/pages/menus.vue'),
          })
        }
        if (options.publicMenus) {
          pages.push({
            name: 'KitchenMenuPage',
            path: '/kitchens/:slug/menus/:menuId',
            file: resolver.resolve('./runtime/menu/pages/browse.vue'),
          })
        }
      })
      addServerHandler({
        route: '/api/kitchens/onboarding/shell',
        method: 'post',
        handler: resolver.resolve(
          './runtime/server/api/kitchens/onboarding/shell.post.ts'
        ),
      })
      addServerHandler({
        route: '/api/workspace/kitchen/update',
        method: 'patch',
        handler: resolver.resolve(
          './runtime/server/api/workspace/kitchen/update.patch.ts'
        ),
      })
      if (options.workspaceItems) {
        for (const method of ['post', 'patch'] as const) {
          addServerHandler({
            route: '/api/workspace/kitchen/dishes',
            method,
            handler: resolver.resolve(
              `./runtime/server/api/workspace/kitchen/dishes/index.${method}.ts`
            ),
          })
        }
      }
      if (options.workspaceMenus) {
        for (const [path, file] of [
          ['/api/workspace/kitchen/menus', 'index'],
          ['/api/workspace/kitchen/menus/section', 'section'],
          ['/api/workspace/kitchen/menus/item', 'item'],
        ]) {
          addServerHandler({
            route: path,
            method: 'post',
            handler: resolver.resolve(
              `./runtime/server/api/workspace/kitchen/menus/${file}.post.ts`
            ),
          })
        }
      }
      if (options.publicMenus) {
        addServerHandler({
          route: '/api/workspace/kitchen/menus/publish',
          method: 'post',
          handler: resolver.resolve(
            './runtime/server/api/workspace/kitchen/menus/publish.post.ts'
          ),
        })
        addServerHandler({
          route: '/api/menus/:menuId',
          method: 'get',
          handler: resolver.resolve(
            './runtime/server/api/menus/[menuId].get.ts'
          ),
        })
      }
      return
    }
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

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) =>
        configureRuntime(nuxt, 'kitchens', {
          enabled: true,
          defaultKitchenId: String(options.defaultKitchenId || '').trim(),
        }),
      composables: (resolver) => {
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
      },
      components: configureComponents,
      layouts: registerLayoutComponents,
      pages: configurePages,
      assets: configureAssets,
    })
  },
})
