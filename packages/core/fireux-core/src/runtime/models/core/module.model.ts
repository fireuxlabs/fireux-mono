/**
 * Minimal Firestore payload stored at `modules/<moduleId>` via the registry sync.
 * The document id doubles as the slug, so we only persist the owning team + name.
 */
export interface FireuxModuleRegistryDoc {
  name: string
  team: string
}
