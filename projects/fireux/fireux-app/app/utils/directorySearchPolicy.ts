export const NON_INDEXABLE_DIRECTORY_APP_IDS = new Set(['fireux-blank'])

const text = (value: unknown) => String(value ?? '').trim()

export const isDirectoryAppIndexable = (appId: string) =>
  !NON_INDEXABLE_DIRECTORY_APP_IDS.has(text(appId))

export const isDirectoryEcosystemIndexable = (ecosystemId: string) =>
  Boolean(text(ecosystemId))
