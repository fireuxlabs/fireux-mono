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
