import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { registerReservedRootRouteKeys } from 'fireux-core/config/module/reserved-route-keys'

const normalizeFile = (value: unknown) =>
  String(value ?? '').replaceAll('\\', '/')

const appendAlias = (page: any, alias: string) => {
  const aliases = Array.isArray(page.alias)
    ? page.alias
    : page.alias
      ? [page.alias]
      : []

  if (!aliases.includes(alias)) page.alias = [...aliases, alias]
}

const addTenantMenuAliases = (pages: any[]) => {
  for (const page of pages) {
    const file = normalizeFile(page?.file)

    if (file.endsWith('/runtime/pages/menus/[menuId]/index.vue')) {
      appendAlias(page, '/:menuId')
    }
    if (file.endsWith('/runtime/pages/menus/[menuId]/qr.vue')) {
      appendAlias(page, '/:menuId/qr')
    }
    if (Array.isArray(page?.children)) addTenantMenuAliases(page.children)
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
  ensureRuntimeLayer(resolver, nuxt)

  const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
  const role = String(runtimeConfig.public?.fireux?.role ?? '').trim()
  if (role !== 'tenant') return

  registerReservedRootRouteKeys(tenantAppPageRouteKeys(nuxt))
  nuxt.hook('pages:extend', addTenantMenuAliases)
}
