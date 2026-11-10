/** Local date/time values are supplied and interpreted by the host. */
export type BookingSlot = { id: string; startAt: string; endAt: string }
export type BookingConfiguration = { title: string; slots: BookingSlot[] }
export type BookingContact = { name: string; email: string }
export type BookingSubmission = {
  requestId: string
  slotId: string
  contact: BookingContact
}
export type BookingReceipt = { reference: string }
/** The host validates availability, authority and idempotency before returning. */
export type BookingConfirmationHandler = (
  submission: BookingSubmission
) => Promise<BookingReceipt>
export type ConfirmedBooking = {
  title: string
  slot: BookingSlot
  contact: BookingContact
  receipt: BookingReceipt
}
