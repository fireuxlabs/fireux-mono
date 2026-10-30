import type { KitchenMenuReview } from 'fireux-kitchens/runtime/menu/models/menu-review.model'
export type MenuExpressReview = KitchenMenuReview
export type MenuExpressStage =
  | 'received'
  | 'preparing'
  | 'review'
  | 'approved'
  | 'delivered'
export type MenuExpressRequest = {
  id: string
  contact: { name: string; email: string }
  venue: string
  location: string
  sourceUrl: string
  instructions: string
  demo: boolean
  stage: MenuExpressStage
  payment: {
    status: 'unpaid' | 'pending' | 'paid' | 'failed'
    sessionId: string
    attempt: number
    priceId: string
  }
  target: { kitchenId: string; menuId: string } | null
  review: MenuExpressReview | null
  approval: { revision: string; at: string } | null
  correction: string
  delivery: { menuPath: string; qrPath: string } | null
  sources: Array<{ id: string; name: string; type: string }>
  createdAt: string
  updatedAt: string
}
