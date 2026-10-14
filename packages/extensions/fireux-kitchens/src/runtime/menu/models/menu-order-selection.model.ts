export type MenuOrderSelection = {
  sectionId: string
  itemId: string
  optionId?: string
  quantity: number
}
export type MenuOrderPricing = {
  currency: string
  total: number
  lines: Array<{ line_id: string; unit_price: number; total: number }>
}
