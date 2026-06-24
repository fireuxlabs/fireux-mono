import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const baseServerHandlers = [
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/upload.post',
  },
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'options',
    handler: './runtime/server/api/console/kitchen/menus/upload.options',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'get',
    handler: './runtime/server/api/console/kitchen/menus/upload/availability.get',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'options',
    handler:
      './runtime/server/api/console/kitchen/menus/upload/availability.options',
  },
] satisfies FireuxServerHandler[]

const aiServerHandlers = [
  {
    route: '/api/console/kitchen/menus/process',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/process.post',
  },
] satisfies FireuxServerHandler[]

const fireuxModules = (nuxt?: Nuxt) => {
  const runtime = (nuxt?.options.runtimeConfig ?? {}) as Record<string, any>
  const modules = runtime.public?.fireux?.modules

  return Array.isArray(modules) ? modules.map(String) : []
}

export function configureServer(resolver: Resolver, nuxt?: Nuxt) {
  registerServerHandlers(resolver, baseServerHandlers)

  // Kitchen AI processing depends on fireux-ai. Tenant apps can still consume kitchen menus without bundling AI server utilities.
  if (fireuxModules(nuxt).includes('fireux-ai')) {
    registerServerHandlers(resolver, aiServerHandlers)
  }
}
