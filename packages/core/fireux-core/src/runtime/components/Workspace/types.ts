export type WorkspaceTargetMediaFit = 'cover' | 'contain'

export type WorkspaceTargetCard = {
  id: string
  title: string
  to?: string
  imageUrl?: string
  imageAlt?: string
  imageFit?: WorkspaceTargetMediaFit
  imageBackground?: string
  icon?: string
  subtitle?: string
  meta?: string
  badges?: string[]
}
