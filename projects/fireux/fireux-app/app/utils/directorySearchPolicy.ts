export const NON_INDEXABLE_DIRECTORY_APP_IDS = new Set(['fireux-blank'])
export const RETIRED_PUBLIC_ECOSYSTEM_IDS = new Set(['cleanbox'])

const text = (value: unknown) => String(value ?? '').trim()

export const isDirectoryAppIndexable = (appId: string) =>
  !NON_INDEXABLE_DIRECTORY_APP_IDS.has(text(appId))

export const isDirectoryEcosystemIndexable = (ecosystemId: string) =>
  !RETIRED_PUBLIC_ECOSYSTEM_IDS.has(text(ecosystemId))
