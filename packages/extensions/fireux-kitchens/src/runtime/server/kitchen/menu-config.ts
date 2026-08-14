import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from './mutation-authority.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const optionalId = (value: unknown, label: string) => {
  const id = String(value ?? '').trim()
  return id ? requireFirestoreDocumentId(id, label) : ''
}

export async function updateKitchenMenuConfig(event: H3Event, input: unknown) {
  const source = record(input)
  const allowed = new Set([
    'kitchen_id',
    'primary_menu_id',
    'specials_enabled',
    'specials_menu_id',
  ])
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    throw createError({
      statusCode: 400,
      statusMessage: `Menu configuration contains unsupported field: ${unsupported}.`,
    })
  }
  const kitchenId = requireFirestoreDocumentId(source.kitchen_id, 'Kitchen id')
  const primaryMenuId = optionalId(source.primary_menu_id, 'Primary Menu id')
  const specialsMenuId = optionalId(source.specials_menu_id, 'Specials Menu id')
  if (typeof source.specials_enabled !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Specials enabled must be boolean.',
    })
  }
  if (primaryMenuId && primaryMenuId === specialsMenuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Primary and Specials must be different Menus.',
    })
  }

  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const current = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    mutations.update(current.supports, kitchenId, {
      'console.menus.primary_menu_id': primaryMenuId || FieldValue.delete(),
      'console.menus.specials_enabled': source.specials_enabled === true
        ? true
        : FieldValue.delete(),
      'console.menus.specials_menu_id': specialsMenuId || FieldValue.delete(),
      updated: serverAuditStamp({ by: actor.uid, appId: current.ownerAppId }),
    })
  })

  return {
    ok: true as const,
    kitchen_id: kitchenId,
    primary_menu_id: primaryMenuId,
    specials_enabled: source.specials_enabled === true,
    specials_menu_id: specialsMenuId,
  }
}
