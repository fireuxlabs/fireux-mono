import type { Item } from '../records/menus/items/item'

/** Authored identity changes; media uses the protected upload command. */
export type ItemIdentityChanges = Partial<Pick<Item, 'name' | 'description'>>

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function normalizeStamp(
  value: unknown
): NonNullable<Item['created']> | undefined {
  const source = record(value)
  const at = record(source.at)
  if (
    typeof at.seconds !== 'number' ||
    !Number.isInteger(at.seconds) ||
    typeof at.nanoseconds !== 'number' ||
    !Number.isInteger(at.nanoseconds) ||
    at.nanoseconds < 0 ||
    at.nanoseconds >= 1_000_000_000
  )
    return undefined
  return {
    at: { seconds: at.seconds, nanoseconds: at.nanoseconds },
    ...(text(source.by) ? { by: text(source.by) } : {}),
    ...(text(source.app_id) ? { app_id: text(source.app_id) } : {}),
  }
}

/** Read only Item-owned identity from an existing document; path identity wins. */
export function readItemIdentity(id: string, value: unknown): Item {
  const source = record(value)
  const description = text(source.description)
  const image = text(source.image)
  const created = normalizeStamp(source.created)
  const updated = normalizeStamp(source.updated)
  return {
    id,
    name: text(source.name),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(created ? { created } : {}),
    ...(updated
      ? {
          updated: {
            at: updated.at,
            ...(updated.by ? { by: updated.by } : {}),
          },
        }
      : {}),
  }
}
