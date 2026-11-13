/** Response shared by the configured-App initialization command and its client. */
export type AppInitializationResult = {
  ok: true
  appId: string
  userId: string
  appCreated: boolean
  ecosystemCreated: boolean
  membershipCreated: boolean
  membershipUpdated: boolean
}
