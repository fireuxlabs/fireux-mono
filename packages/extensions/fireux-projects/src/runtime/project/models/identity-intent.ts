export type ProjectIdentityIntent = {
  action: 'read' | 'update' | 'none'
  name: string | null
  description: string | null
  imageUrl: string | null
  message: string
}
