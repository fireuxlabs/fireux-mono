import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { publicKitchenMenuId } from '../../utils/menu-route'

type RootMenuEntryInput = {
  appId: string
  kitchenId: string
  menuId: string
  menuData: Record<string, unknown>
  stamp: DocumentData
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const text = (value: unknown) => String(value ?? '').trim()

const readFirst = (...values: unknown[]) => values.map(text).find(Boolean) || ''

const rootDocMatchesSource = (
  data: Record<string, unknown>,
  input: RootMenuEntryInput
) => {
  const source = record(data.source)

  return (
    readRecordString(source, 'kitchen_id') === input.kitchenId &&
    readRecordString(source, 'menu_id') === input.menuId
  )
}

const kitchenSlug = (kitchen: Record<string, unknown>) =>
  normalizeSlug(
    readFirst(
      record(kitchen.identity).slug,
      record(kitchen.identity).display_name,
      kitchen.display_name,
      kitchen.name
    )
  )

async function availableRootMenuId(
  tx: GuardedServerTransaction,
  input: RootMenuEntryInput,
  kitchenSlug: string
) {
  const menuId = normalizeSlug(input.menuId)
  const qualified = publicKitchenMenuId(normalizeSlug(kitchenSlug), menuId)
  const candidates = [qualified].filter(Boolean)
  let fallbackIndex = 2

  while (candidates.length < 20 && qualified) {
    candidates.push(`${qualified}-${fallbackIndex}`)
    fallbackIndex += 1
  }

  for (const candidate of Array.from(new Set(candidates))) {
    const snap = await tx.read(FIRESTORE_MUTATION_TARGETS.menus, candidate)
    if (!snap.exists || rootDocMatchesSource(snap.data || {}, input)) {
      return candidate
    }
  }

  throw new Error('No available public Menu identifier.')
}

export async function ensureKitchenMenuRootEntry(
  tx: GuardedServerTransaction,
  input: RootMenuEntryInput
) {
  // Root menus are route/list projections; scoped kitchen menus remain the content authority.
  const kitchen = await tx.read(
    FIRESTORE_MUTATION_TARGETS.kitchens,
    input.kitchenId
  )
  const slug = kitchenSlug(kitchen.data || {})
  const related: Array<{ id: string; data: DocumentData }> = []
  let afterId: string | undefined
  while (true) {
    const page = await tx.query(FIRESTORE_MUTATION_TARGETS.menus, {
      field: 'source.kitchen_id',
      op: '==',
      value: input.kitchenId,
      limit: 100,
      afterId,
    })
    related.push(...page)
    if (page.length < 100) break
    afterId = page.at(-1)!.id
  }
  const matching = related.filter((document) =>
    rootDocMatchesSource(document.data, input)
  )
  const qualified = publicKitchenMenuId(slug, normalizeSlug(input.menuId))
  const existing =
    matching.find((document) => document.id === qualified) || matching[0]
  const rootId = existing?.id || (await availableRootMenuId(tx, input, slug))
  const rootSnap = await tx.read(FIRESTORE_MUTATION_TARGETS.menus, rootId)
  const rootData = rootSnap.data || {}

  const description = readRecordString(input.menuData, 'description')
  const rootPatch = {
    kind: 'menu',
    status: readRecordString(input.menuData, 'status') || 'draft',
    name: readRecordString(input.menuData, 'name') || input.menuId,
    ...(description
      ? { description }
      : rootSnap.exists && Object.hasOwn(rootData, 'description')
        ? { description: FieldValue.delete() }
        : {}),
    source: {
      app_id:
        readRecordString(record(rootData.source), 'app_id') || input.appId,
      kitchen_id: input.kitchenId,
      menu_id: input.menuId,
    },
    created: record(rootData.created).at ? rootData.created : input.stamp,
    updated: input.stamp,
  }
  if (rootSnap.exists) {
    tx.update<DocumentData>(FIRESTORE_MUTATION_TARGETS.menus, rootId, rootPatch)
  } else {
    tx.create<DocumentData>(FIRESTORE_MUTATION_TARGETS.menus, rootId, rootPatch)
  }

  // Retain redundant projections as archived records; never duplicate the same source.
  for (const duplicate of matching) {
    if (duplicate.id !== rootId && duplicate.data.status !== 'archived') {
      tx.update(FIRESTORE_MUTATION_TARGETS.menus, duplicate.id, {
        status: 'archived',
        updated: input.stamp,
      })
    }
  }

  return {
    id: rootId,
    path: `/menus/${encodeURIComponent(rootId)}`,
  }
}
