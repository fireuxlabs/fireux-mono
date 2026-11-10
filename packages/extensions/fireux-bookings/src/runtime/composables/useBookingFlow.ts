import { computed, onScopeDispose, ref, watch } from 'vue'
import type {
  BookingConfiguration,
  BookingConfirmationHandler,
  BookingContact,
  BookingSubmission,
  ConfirmedBooking,
} from '../types/booking-surface'
import { isValidBookingSlot } from '../utils/booking-slot'

export function useBookingFlow(
  configuration: () => BookingConfiguration,
  confirm: () => BookingConfirmationHandler
) {
  const step = ref(0)
  const slotId = ref('')
  const contact = ref<BookingContact>({ name: '', email: '' })
  const pending = ref(false)
  const error = ref('')
  const confirmed = ref<ConfirmedBooking | null>(null)
  let generation = 0
  let requestId = ''

  const slots = computed(() => {
    const candidates = configuration().slots
    return candidates.filter(
      (slot) =>
        isValidBookingSlot(slot) &&
        candidates.filter((other) => other.id === slot.id).length === 1
    )
  })
  const selectedSlot = computed(() =>
    slots.value.find((slot) => slot.id === slotId.value)
  )
  const contactReady = computed(
    () =>
      Boolean(contact.value.name.trim()) &&
      contact.value.name.length <= 100 &&
      contact.value.email.length <= 254 &&
      /^[^\s@]+@[^\s@]+$/.test(contact.value.email.trim())
  )

  function restart() {
    generation += 1
    requestId = ''
    step.value = 0
    slotId.value = ''
    contact.value = { name: '', email: '' }
    pending.value = false
    error.value = ''
    confirmed.value = null
  }

  function selectTime(id: string) {
    if (pending.value || !slots.value.some((slot) => slot.id === id)) return
    slotId.value = id
    requestId = ''
    error.value = ''
  }

  function updateContact(value: BookingContact) {
    if (pending.value) return
    contact.value = { ...value }
    requestId = ''
    error.value = ''
  }

  function next() {
    if (pending.value) return
    if (step.value === 0 && selectedSlot.value) step.value = 1
    else if (step.value === 1 && selectedSlot.value && contactReady.value)
      step.value = 2
  }

  function back() {
    if (pending.value || step.value < 1 || step.value > 2) return
    step.value -= 1
    error.value = ''
  }

  async function submit() {
    if (
      pending.value ||
      step.value !== 2 ||
      !selectedSlot.value ||
      !contactReady.value
    )
      return
    const current = generation
    const snapshot = {
      title: configuration().title.trim() || 'Booking',
      slot: { ...selectedSlot.value },
      contact: {
        name: contact.value.name.trim(),
        email: contact.value.email.trim(),
      },
    }
    requestId ||= crypto.randomUUID()
    const submission: BookingSubmission = {
      requestId,
      slotId: snapshot.slot.id,
      contact: { ...snapshot.contact },
    }
    pending.value = true
    error.value = ''
    try {
      const receipt = await confirm()(submission)
      if (current !== generation) return
      if (!receipt.reference?.trim())
        throw new Error('The booking could not be confirmed. Please try again.')
      confirmed.value = {
        ...snapshot,
        receipt: { reference: receipt.reference },
      }
      step.value = 3
    } catch (cause) {
      if (current !== generation) return
      error.value =
        cause instanceof Error
          ? cause.message
          : 'The booking could not be confirmed. Please try again.'
    } finally {
      if (current === generation) pending.value = false
    }
  }

  watch([() => JSON.stringify(configuration()), confirm], restart, {
    flush: 'sync',
  })
  onScopeDispose(() => {
    generation += 1
  })

  return {
    step,
    slotId,
    contact,
    pending,
    error,
    confirmed,
    slots,
    selectedSlot,
    contactReady,
    selectTime,
    updateContact,
    next,
    back,
    submit,
    restart,
  }
}
