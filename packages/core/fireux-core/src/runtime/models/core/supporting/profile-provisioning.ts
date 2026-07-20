// Concurrent edit — 2026-07-20 18:25 CEST — Repo Efficiency Pass 2 of 6: define the exact App gate and canonical profile-index order.

export function isRuntimeProfileEnabled(
  configuredProfiles: unknown,
  profileId: string
): boolean {
  return (
    Array.isArray(configuredProfiles) &&
    configuredProfiles.some((configured) => configured === profileId)
  )
}

export function canonicalProfileIndex(
  profileIds: readonly string[],
  profileOrder: readonly string[],
  includeProfileId?: string
): string[] {
  const included = new Set(profileIds)
  if (includeProfileId) included.add(includeProfileId)
  return profileOrder.filter((profileId) => included.has(profileId))
}

export type ProfileProvisionAtomicity =
  | 'single-database-atomic'
  | 'cross-database-two-phase'

export type ProfileProvisionResult = {
  ok: true
  userId: string
  profileId: string
  createdCore: boolean
  createdApp: boolean
  atomicity: ProfileProvisionAtomicity
}
