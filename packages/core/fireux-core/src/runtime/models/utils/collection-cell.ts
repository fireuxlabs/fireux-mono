export type CollectionCellData = {
  title: string
  description?: string
  image?: string
  imageText?: string
  imageStyle?: 'avatar' | 'cover'
  fallbackIcon?: string
  meta?: string
  badges?: string[]
  actionLabel?: string
  to: string
}
