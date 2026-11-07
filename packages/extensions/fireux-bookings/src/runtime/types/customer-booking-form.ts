export type BookingCustomerDetails = {
  guestName: string
  guestEmail: string
  groupSize: number
}

export type BookingAvailabilityView = {
  status: 'idle' | 'pending' | 'available' | 'unavailable' | 'error'
  message: string
}

export type BookingConfirmationView = {
  eyebrow?: string
  title: string
  message: string
  details?: Array<{ label: string; value: string }>
}
