import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readMenuKitchenBySlug } from './kitchen-scope'
import type { TenantMenuScope } from './target-types'
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const configurationError = (statusMessage: string) =>
  createError({ statusCode: 500, statusMessage })
const runtimeApp = () =>
  record((useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>)
export const currentMenuAppId = () => text(runtimeApp().id)

export const isTenantMenuApp = () => text(runtimeApp().role) === 'tenant'

export const requireMenuAppId = () => {
  const appId = currentMenuAppId()
  if (appId) return appId

  throw configurationError('Menu App context is not configured.')
}

export async function resolveTenantMenuScope(): Promise<TenantMenuScope | null> {
  if (!isTenantMenuApp()) return null

  const appId = currentMenuAppId()
  const targetSnapshot = await getRuntimeFirestore()
    .collection('kitchens')
    .where('management.mode', '==', 'app')
    .where('management.app_id', '==', appId)
    .limit(2)
    .get()
  const targetIds = targetSnapshot.docs.map((document) => document.id)
  if (targetIds.length !== 1) {
    throw configurationError(
      'Tenant menu scope requires exactly one Kitchen target.'
    )
  }

  const kitchenId = targetIds[0] || ''

  const rootKitchenSnap = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenId)
    .get()
  if (!rootKitchenSnap.exists) {
    throw configurationError('Tenant menu Kitchen target was not found.')
  }

  const rootKitchenData = rootKitchenSnap.data() || {}

  return {
    appId: requireMenuAppId(),
    kitchenId,
    kitchenSlug: readRecordString(rootKitchenData, 'slug'),
    rootKitchenData,
  }
}

export async function resolveDirectoryMenuScope(
  kitchenSlugValue: unknown
): Promise<TenantMenuScope> {
  const kitchenSlug = text(kitchenSlugValue)
  if (!kitchenSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen path is required.',
    })
  }

  const kitchen = await readMenuKitchenBySlug(kitchenSlug)
  if (!kitchen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  return {
    appId: requireMenuAppId(),
    kitchenId: kitchen.id,
    kitchenSlug: readRecordString(kitchen.data, 'slug') || kitchenSlug,
    rootKitchenData: kitchen.data,
  }
}
