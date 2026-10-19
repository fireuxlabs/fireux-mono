export type MenuOrderSelection = {
  menuId?: string
  extraIds?: string[]
  groups?: Record<string, string[]>
  bottle?: 'deposit' | 'exchange'
  offeringIds?: string[]
  expectedUnitMinor?: number
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
