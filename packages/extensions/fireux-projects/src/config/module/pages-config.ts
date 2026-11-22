import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { filterPagesByGlob } from 'fireux-core/config/module/pages-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  const fireux = nuxt.options.runtimeConfig.public?.fireux as
    | { workspaces?: unknown[] }
    | undefined
  const workspaces = Array.isArray(fireux?.workspaces) ? fireux.workspaces : []

  if (!workspaces.includes('project')) {
    filterPagesByGlob(nuxt, [
      resolver.resolve('./runtime/pages/workspace/project/**'),
    ])
    return
  }
  requireNativeRuntimeLayer(resolver, nuxt)
}
