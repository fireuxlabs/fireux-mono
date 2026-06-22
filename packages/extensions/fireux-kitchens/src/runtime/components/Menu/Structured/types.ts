export type MenuStructuredItem = {
  id: string
  name: string
  description?: string
  priceLabel?: string
}

export type MenuStructuredSection = {
  id: string
  label: string
  items: MenuStructuredItem[]
}
