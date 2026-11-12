import type {
  EmailDelivery,
  EmailMessage,
  EmailTransport,
} from '../types/email'

/** Only throw this when the provider definitely did not accept the message. */
export class EmailRejected extends Error {}

export function validateEmail(message: EmailMessage) {
  if (
    !message.id ||
    message.id.length > 200 ||
    !message.subject.trim() ||
    message.subject.length > 300 ||
    /[\r\n]/.test(message.subject) ||
    !message.text.trim() ||
    message.text.length > 100_000
  )
    throw new Error('A message id, subject and text are required.')
  for (const address of [message.from, message.to])
    if (
      address.length > 254 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)
    )
      throw new Error('Enter a valid sender and recipient email address.')
}

/** Process-local delivery ledger for previews and local integration tests. */
export function createEmailDelivery(transport: EmailTransport) {
  const records = new Map<string, EmailDelivery>()
  const active = new Map<string, Promise<EmailDelivery>>()
  const copy = (record: EmailDelivery): EmailDelivery => ({
    ...record,
    message: { ...record.message },
  })
  function send(message: EmailMessage, retry = false): Promise<EmailDelivery> {
    validateEmail(message)
    const existing = records.get(message.id)
    if (
      existing &&
      JSON.stringify(existing.message) !== JSON.stringify(message)
    )
      throw new Error('This message id already belongs to different content.')
    if (active.has(message.id)) return active.get(message.id)!
    if (existing && !(retry && existing.status === 'failed'))
      return Promise.resolve(copy(existing))
    const record: EmailDelivery = {
      message: { ...message },
      status: 'pending',
      attempts: (existing?.attempts ?? 0) + 1,
    }
    records.set(message.id, record)
    const pending = Promise.resolve()
      .then(() => transport({ ...record.message }))
      .then((result) => {
        record.status = result.status
        record.providerId = result.providerId
        return copy(record)
      })
      .catch((error) => {
        record.status = error instanceof EmailRejected ? 'failed' : 'unknown'
        return copy(record)
      })
      .finally(() => active.delete(message.id))
    active.set(message.id, pending)
    return pending
  }
  return { send, list: () => [...records.values()].map(copy) }
}

export const captureEmail: EmailTransport = async () => ({ status: 'captured' })
