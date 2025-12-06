/**
 * Minimal Firestore payload stored at `ecosystems/<ecosystemId>`.
 * Registry sync keeps only normalized name/team plus optional relationship arrays.
 */
export interface FireuxEcosystemRegistryDoc {
  name: string
  team: string
  /** List of app ids that declared this ecosystem via registry sync. */
  apps?: string[]
}
