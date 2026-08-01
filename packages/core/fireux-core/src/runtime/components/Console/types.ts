export type ConsoleTargetMediaFit = 'cover' | 'contain'

export type ConsoleTargetCard = {
  id: string
  title: string
  to?: string
  imageUrl?: string
  imageAlt?: string
  imageFit?: ConsoleTargetMediaFit
  imageBackground?: string
  icon?: string
  subtitle?: string
  meta?: string
  badges?: string[]
}
