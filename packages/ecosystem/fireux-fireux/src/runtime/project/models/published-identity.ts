/** Presentation supplied by the connected App's owning composition. Never stored on Project. */
export type ProjectPublishedIdentity = {
  projectId: string
  appName: string
  sourceUrl: string
  status: 'pending' | 'ready' | 'error'
  description: string
  imageUrl: string
  imageFit?: 'contain' | 'cover'
  message: string
}
