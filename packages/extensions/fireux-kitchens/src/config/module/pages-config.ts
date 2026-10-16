import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'

const normalizeFile = (value: unknown) =>
  String(value ?? '').replaceAll('\\', '/')

const configureMenuDetailRoutes = (pages: any[], tenant: boolean) => {
  for (let index = pages.length - 1; index >= 0; index--) {
    const page = pages[index]
    const file = normalizeFile(page?.file)
    const isDetail = file.endsWith('/runtime/pages/menus/[menuId]/index.vue')
    const isQr = file.endsWith('/runtime/pages/menus/[menuId]/qr.vue')
    if (isDetail || isQr) {
      if (!tenant) {
        pages.splice(index, 1)
        continue
      }
      page.path = isQr ? '/:menuId/qr' : '/:menuId'
    }
    if (Array.isArray(page?.children))
      configureMenuDetailRoutes(page.children, tenant)
  }
}

const tenantAppPageRouteKeys = (nuxt: Nuxt) => {
  const keys = new Set<string>()
  const roots = new Set([
    resolve(nuxt.options.rootDir, 'app/pages'),
    resolve(nuxt.options.srcDir, 'pages'),
    resolve(nuxt.options.srcDir, 'app/pages'),
  ])

  for (const root of roots) {
    if (!existsSync(root)) continue

    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const key = entry.isDirectory()
        ? entry.name
        : entry.isFile() && entry.name.endsWith('.vue')
          ? entry.name.slice(0, -'.vue'.length)
          : ''
      if (
        key &&
        key !== 'index' &&
        !key.startsWith('[') &&
        !key.startsWith('@') &&
        !key.startsWith('(')
      ) {
        keys.add(key.toLowerCase())
      }
    }
  }

  return [...keys]
}

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  requireNativeRuntimeLayer(resolver, nuxt)

  const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
  const role = String(runtimeConfig.public?.fireux?.role ?? '').trim()
  const tenant = role === 'tenant'
  if (tenant) registerReservedRootRouteKeys(tenantAppPageRouteKeys(nuxt))
  nuxt.hook('pages:extend', (pages) => configureMenuDetailRoutes(pages, tenant))
}
