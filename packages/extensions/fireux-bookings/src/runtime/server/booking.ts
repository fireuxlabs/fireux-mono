/** Provider-independent reservation lifecycle. Consumers own policy and storage authority. */
export class BookingError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.name = 'BookingError'
    this.statusCode = statusCode
    this.code = code
  }
}

export type BookingLifecycle<TReservation, TEffect> = {
  reserve: (reservation: TReservation) => Promise<void>
  verify: (reservation: TReservation) => Promise<void>
  createEffect: (reservation: TReservation) => Promise<TEffect>
  confirm: (reservation: TReservation, effect: TEffect) => Promise<void>
  release: (reservation: TReservation) => Promise<void>
}

/**
 * reserve must atomically reject conflicting reservations. Once an external effect
 * may exist, retain the reservation for reconciliation instead of freeing capacity.
 * Callers must reconcile ambiguous provider failures before accepting a retry.
 */
export async function confirmBooking<TReservation, TEffect>(
  reservation: TReservation,
  lifecycle: BookingLifecycle<TReservation, TEffect>
): Promise<TEffect> {
  await lifecycle.reserve(reservation)
  let effectStarted = false
  try {
    await lifecycle.verify(reservation)
    effectStarted = true
    const effect = await lifecycle.createEffect(reservation)
    await lifecycle.confirm(reservation, effect)
    return effect
  } catch (error) {
    if (!effectStarted) {
      try {
        await lifecycle.release(reservation)
      } catch {
        // Failed cleanup retains capacity and fails closed.
      }
    }
    if (error instanceof BookingError) throw error
    throw new BookingError(
      503,
      effectStarted ? 'booking_reconciliation_required' : 'confirmation_unavailable',
      effectStarted
        ? 'Confirmation could not be completed. Contact the operator before retrying.'
        : 'We could not confirm the booking. Please try again later.'
    )
  }
}
