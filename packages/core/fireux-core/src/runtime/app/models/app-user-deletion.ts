export type AppUserDeletionImpact = {
  appId: string
  userId: string
  exists: boolean
  role: string | null
  administratorCount: number
  canDelete: boolean
  blockers: string[]
}
