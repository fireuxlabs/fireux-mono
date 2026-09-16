import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'

export function menuNameAndSlug(event: H3Event, value: unknown) {
  const name = typeof value === 'string' ? value.trim() : ''
  if (!name || name.length > 160) throw createError({ statusCode: 400, statusMessage: 'Menu name must be 1–160 characters.' })
  const fireux = useFireUXConfig(event)
  const keys = useRuntimeConfig(event).public?.fireux?.reservedRouteKeys
  const validation = validatePublicSlug(normalizeSlug(name), {
    label: 'Menu path',
    reservedScope: fireux.isTenant ? 'root' : 'entity',
    ...(fireux.isTenant && Array.isArray(keys) ? { runtimeReservedRouteKeys: keys } : {}),
  })
  if (!validation.isValid) throw createError({ statusCode: 400, statusMessage: validation.message || 'Menu name does not produce a valid path.' })
  return { name, slug: validation.slug }
}

export async function requireAvailableMenuSlug(tx: GuardedServerTransaction, kitchenId: string, slug: string, menuId?: string) {
  const matches = await tx.query(serverKitchenMenusTarget(kitchenId), { field: 'slug', op: '==', value: slug, limit: 2 })
  if (matches.some(menu => menu.id !== menuId)) throw createError({ statusCode: 409, statusMessage: 'A Menu with this path already exists. Choose another name.' })
}
