export type ShareProfileLink = {
  id: string
  label: string
  url: string
}

export type ShareProfile = {
  app_id: string
  links: ShareProfileLink[]
  created?: unknown
  updated?: unknown
}

export function emptyShareProfile(appId: string): ShareProfile {
  return { app_id: appId, links: [] }
}
