export const SPROOCHLI_HOST_DATABASE_ID = 'sproochli' as const

export type SproochliHostTarget = {
  appId: string
  firebaseProjectId: string
  databaseId: typeof SPROOCHLI_HOST_DATABASE_ID
}
