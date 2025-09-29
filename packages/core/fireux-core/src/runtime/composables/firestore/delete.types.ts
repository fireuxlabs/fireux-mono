// Shared deletion types for Firestore entities (users, profiles, etc.)
// Keeping these in one place avoids duplicated auto-import names in Nuxt.

export type DeleteScope = 'core' | 'app' | 'both' | 'auto'

export interface DeleteOptions {
  /** Override target document id; some composables can infer when omitted */
  id?: string
  /** 'core' | 'app' | 'both' | 'auto' (default usually 'auto') */
  scope?: DeleteScope
  /** Delete overlays in ALL apps (uses collectionGroup) */
  allApps?: boolean
  /** Target a specific app (defaults to env appId when applicable) */
  appId?: string
}
