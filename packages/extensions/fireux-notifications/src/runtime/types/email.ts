export type EmailMessage = {
  id: string
  from: string
  to: string
  subject: string
  text: string
}
export type EmailStatus = 'pending' | 'captured' | 'sent' | 'failed' | 'unknown'
export type EmailDelivery = {
  message: EmailMessage
  status: EmailStatus
  attempts: number
  providerId?: string
}
export type EmailTransport = (
  message: EmailMessage
) => Promise<{ status: 'captured' | 'sent'; providerId?: string }>
