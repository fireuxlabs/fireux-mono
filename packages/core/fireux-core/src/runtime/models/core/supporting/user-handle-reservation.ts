// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: define the trusted reservation boundary.

export type UserHandleReservationCreateInput = {
  display_name: string
  avatar?: string | null
}

export type UserHandleReservationInput = {
  handle: string
  create?: UserHandleReservationCreateInput
}

export type UserHandleReservationResult = {
  uid: string
  handle: string
  created: boolean
  changed: boolean
  repaired: boolean
}
