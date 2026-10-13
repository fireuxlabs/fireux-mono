import type { OrderRequest } from './order-request.model'

/** Preparation adds its own progress to the small Order contract. */
export type KitchenPreparationOrder = OrderRequest & {
  state: 'preparing' | 'ready'
}
