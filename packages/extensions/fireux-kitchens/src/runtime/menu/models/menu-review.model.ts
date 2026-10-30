export type KitchenMenuReview = {
  revision: string
  name: string
  description: string
  currency: string
  kitchenSlug: string
  menuSlug: string
  sections: Array<{
    id: string
    label: string
    items: Array<{
      id: string
      name: string
      description: string
      price: number
      options: Array<{ label: string; price: number }>
    }>
  }>
}
