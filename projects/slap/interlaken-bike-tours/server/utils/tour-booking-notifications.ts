import {
  captureEmail,
  createEmailDelivery,
} from 'fireux-notifications/runtime/utils/email-delivery'
import { createSmtpEmailTransport } from 'fireux-notifications/runtime/server/smtp'
import type { EmailDelivery } from 'fireux-notifications/runtime/types/email'

type ConfirmedTour = {
  id: string
  tourName: string
  date: string
  departureTime: string
  groupSize: number
  totalPriceChf: number
}
let delivery: ReturnType<typeof createEmailDelivery> | undefined
function localDelivery() {
  if (!import.meta.dev || process.env.BOOKINGS_LOCAL_TEST !== 'true') return
  if (!delivery) {
    const transport =
      process.env.BOOKINGS_TEST_EMAIL_SEND === 'true'
        ? createSmtpEmailTransport({
            host: process.env.NOTIFICATIONS_SMTP_HOST ?? '',
            port: Number(process.env.NOTIFICATIONS_SMTP_PORT),
            user: process.env.NOTIFICATIONS_SMTP_USER ?? '',
            password: process.env.NOTIFICATIONS_SMTP_PASSWORD ?? '',
          })
        : captureEmail
    delivery = createEmailDelivery(transport)
  }
  return delivery
}

/** Local proving integration. Production needs a durable outbox at the booking owner. */
export async function notifyLocalTourBooking(
  booking: ConfirmedTour
): Promise<EmailDelivery | undefined> {
  const sender = localDelivery()
  if (!sender) return
  return sender.send({
    id: `booking-confirmed:${booking.id}`,
    from: process.env.BOOKINGS_TEST_EMAIL_FROM ?? '',
    to: process.env.BOOKINGS_TEST_EMAIL_TO ?? '',
    subject: `Test booking confirmed · ${booking.tourName}`,
    text: `${booking.tourName}\n${booking.date} at ${booking.departureTime} (Europe/Zurich)\n${booking.groupSize} people · CHF ${booking.totalPriceChf}\nReference: ${booking.id}\n\nThis is a local test booking.`,
  })
}

export function listLocalBookingEmails() {
  return localDelivery()?.list() ?? []
}
