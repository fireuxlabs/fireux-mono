export type { KitchenSale, KitchenSaleLine } from '../models/sale.model'

export const KitchenSaleStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/sales/{saleId}', collection: 'sales', parent: 'kitchen', idParam: 'saleId' } as const
export const KitchenSaleSchemaVersion = 1 as const

export function kitchenSalePath(input: { appId: string; kitchenId: string; saleId: string }): string {
  return `kitchens/${input.kitchenId}/sales/${input.saleId}`
}
