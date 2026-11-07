export type SandboxBooking = {
  id: string
  serviceName: string
  guestName: string
  guestEmail: string
  groupSize: number
  summary: string
  startAt: string
  endAt: string
  status: 'confirmed'
  calendarEventId: string
}

export type SandboxAvailability = {
  available: boolean
  busy: Array<{ start: string; end: string }>
}

export type SandboxBookingConfiguration = {
  serviceName: string
  description: string
  confirmLabel: string
  maxGroupSize: number
}
