import type {
  BookingConfiguration,
  BookingConfirmationHandler,
  BookingReceipt,
} from 'fireux-bookings/runtime/types/booking-surface'
import { isValidBookingSlot } from 'fireux-bookings/runtime/utils/booking-slot'

export function useBookingPreview() {
  const configuration = ref<BookingConfiguration>({
    title: '',
    slots: [{ id: 'first', startAt: '', endAt: '' }],
  })
  const receipts = new Map<string, BookingReceipt>()
  const confirm: BookingConfirmationHandler = async (submission) => {
    const existing = receipts.get(submission.requestId)
    if (existing) return existing
    const slot = configuration.value.slots.find(
      (item) => item.id === submission.slotId
    )
    if (!slot || !isValidBookingSlot(slot))
      throw new Error('This time is no longer available. Choose another time.')
    const receipt = {
      reference: `PREVIEW-${String(receipts.size + 1).padStart(3, '0')}`,
    }
    receipts.set(submission.requestId, receipt)
    return receipt
  }
  return { configuration, confirm }
}
