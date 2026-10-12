import type { KitchenOrder } from './order'
export type OrderBoardFilters = {
  type: string
  timing: 'all' | 'scheduled' | 'immediate'
}
export function matchesOrderBoardFilters(
  order: KitchenOrder,
  filters: OrderBoardFilters
): boolean {
  if (filters.type !== 'all' && order.order_type !== filters.type) return false
  const scheduled =
    order.order_type === 'pre_order' ||
    order.collection?.mode === 'scheduled' ||
    order.status === 'scheduled' ||
    order.status === 'awaiting_preparation'
  return (
    filters.timing === 'all' ||
    (filters.timing === 'scheduled' ? scheduled : !scheduled)
  )
}
