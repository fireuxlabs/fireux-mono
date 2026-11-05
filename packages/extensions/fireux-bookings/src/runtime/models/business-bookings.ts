export type BookingAvailability = {
  revision: number
  openWeekdays: number[]
  closedDates: string[]
  departureTime: string
}
export type BusinessBooking = {
  id: string
  service_id: string
  service_name: string
  date: string
  start_at: string
  end_at: string
  party_size: number
  unit_price: number
  total_price: number
  currency: string
  guest_name: string
  guest_email: string
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
}
