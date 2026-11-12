import nodemailer from 'nodemailer'
import type { EmailTransport } from '../types/email'
import { EmailRejected, validateEmail } from '../utils/email-delivery'

export function createSmtpEmailTransport(config: {
  host: string
  port: number
  user: string
  password: string
}): EmailTransport {
  if (
    !config.host ||
    !config.user ||
    !config.password ||
    ![465, 587].includes(config.port)
  )
    throw new Error('SMTP host, credentials and port 465 or 587 are required.')
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
  return async (message) => {
    validateEmail(message)
    const result = await transport.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    })
    if (!result.accepted.length)
      throw new EmailRejected('SMTP rejected the recipient.')
    return { status: 'sent', providerId: result.messageId }
  }
}
