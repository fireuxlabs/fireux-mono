import type { H3Event } from 'h3'

export type ProcessKitchenMenuAiReviewInput = {
  event: H3Event
  appId: string
  kitchenId: string
  menuId: string
  uploadId: string
  uid: string
  currencyCode: string
  quality?: string
  limit?: number
  force?: boolean
}
