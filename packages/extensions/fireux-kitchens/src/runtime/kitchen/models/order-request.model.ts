/**
 * Minimal internal Order contract using UBL Order/OrderLine/LineItem/Item vocabulary.
 * This is a UBL-informed subset, not a conformant UBL document or shared package API.
 * Kitchen owns the first consumer until another industry proves a shared contract.
 */
export type OrderRequest = {
  id: string
  number: string
  lines: OrderLine[]
}

export type OrderLine = {
  id: string
  item: { name: string }
  quantity: number
  unit_code: string
}
