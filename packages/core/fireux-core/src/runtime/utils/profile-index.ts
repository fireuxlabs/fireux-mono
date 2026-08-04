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
