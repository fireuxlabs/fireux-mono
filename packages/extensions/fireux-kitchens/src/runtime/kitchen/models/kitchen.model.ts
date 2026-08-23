export type Kitchen = {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive' | 'archived'
  visibility: boolean
}
