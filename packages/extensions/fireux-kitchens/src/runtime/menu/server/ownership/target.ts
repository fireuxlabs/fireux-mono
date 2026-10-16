import { createError } from 'h3'
import { resolveTenantMenuScope, resolveDirectoryMenuScope } from './app-scope'
import { scopedTarget } from './scoped-target'
import type { MenuTarget } from './target-types'

const text = (value: unknown) => String(value ?? '').trim()
const isFirestoreDocumentId = (value: string) =>
  Boolean(value) &&
  value !== '.' &&
  value !== '..' &&
  !value.includes('/') &&
  !(value.startsWith('__') && value.endsWith('__')) &&
  new TextEncoder().encode(value).length <= 1_500
export async function resolveMenuTarget(
  menuIdValue: unknown,
  kitchenSlugValue?: unknown
): Promise<MenuTarget> {
  const menuId = text(menuIdValue)
  const kitchenSlug = text(kitchenSlugValue)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }
  if (!isFirestoreDocumentId(menuId)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const tenantScope = await resolveTenantMenuScope()
  if (tenantScope) {
    if (kitchenSlug) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu not found.',
      })
    }

    return scopedTarget('tenant-menu', menuId, tenantScope)
  }

  if (kitchenSlug) {
    const directoryScope = await resolveDirectoryMenuScope(kitchenSlug)

    return scopedTarget('directory-menu', menuId, directoryScope)
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Choose a Kitchen Menu.',
  })
}
