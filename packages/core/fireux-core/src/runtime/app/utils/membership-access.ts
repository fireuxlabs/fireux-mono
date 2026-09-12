import type { FirebaseTimestamp } from '../../../types/firebase'

/** A domain-owned set of ids, valid for one lifetime of an App membership. */
export type MembershipAccess = {
  ids: string[]
  membership_created_at: FirebaseTimestamp
}

function invalid(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 409 })
}

function timestamp(value: unknown): FirebaseTimestamp | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as FirebaseTimestamp
  return Number.isSafeInteger(candidate.seconds) &&
    Number.isInteger(candidate.nanoseconds) &&
    candidate.nanoseconds >= 0 &&
    candidate.nanoseconds < 1_000_000_000
    ? candidate
    : null
}

export function membershipCreatedAt(membership: unknown): FirebaseTimestamp {
  const value = timestamp(
    (membership as { created?: { at?: unknown } } | null)?.created?.at
  )
  if (!value) invalid('App membership has no valid creation timestamp.')
  return value
}

export function readMembershipAccess(value: unknown): MembershipAccess | null {
  if (value == null) return null
  if (typeof value !== 'object' || Array.isArray(value))
    invalid('Membership access has an invalid stored shape.')
  const access = value as Partial<MembershipAccess>
  const bound = timestamp(access.membership_created_at)
  if (!bound) invalid('Membership access has no valid membership timestamp.')
  if (
    !Array.isArray(access.ids) ||
    access.ids.length > 500 ||
    access.ids.some(
      (id) =>
        typeof id !== 'string' || !id || id !== id.trim() || id.includes('/')
    ) ||
    new Set(access.ids).size !== access.ids.length
  )
    invalid('Membership access has invalid stored ids.')
  return { ids: [...access.ids], membership_created_at: bound }
}

/** Missing or superseded access grants nothing; malformed current data is an error. */
export function readMembershipAccessIds(
  value: unknown,
  membership: unknown
): string[] {
  const created = membershipCreatedAt(membership)
  const access = readMembershipAccess(value)
  if (!access) return []
  const bound = access.membership_created_at
  if (
    bound.seconds !== created.seconds ||
    bound.nanoseconds !== created.nanoseconds
  )
    return []
  return access.ids
}

/** Validate the complete next record before a domain command stores it. */
export function createMembershipAccess(
  ids: string[],
  membership: unknown
): MembershipAccess {
  return readMembershipAccess({
    ids,
    membership_created_at: membershipCreatedAt(membership),
  })!
}
