import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  const fireux = nuxt.options.runtimeConfig.public?.fireux as
    | { workspaces?: unknown[] }
    | undefined
  const workspaces = Array.isArray(fireux?.workspaces)
    ? fireux.workspaces
    : []

  if (!workspaces.includes('kitchen')) return
  configurePages(resolver, nuxt)
}
