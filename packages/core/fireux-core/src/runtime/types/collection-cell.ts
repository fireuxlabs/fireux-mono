export type CollectionCellData = {
  title: string
  description?: string
  image?: string
  imageText?: string
  imageStyle?: 'avatar' | 'cover'
  imageFit?: 'contain' | 'cover'
  imageBackground?: string
  fallbackIcon?: string
  meta?: string
  badges?: string[]
  actionLabel?: string
  to: string
}
