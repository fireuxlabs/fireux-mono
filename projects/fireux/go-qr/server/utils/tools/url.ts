import type { GoQrToolContract } from './types'

export const urlTool = {
  id: 'url',
  provider: 'go-qr',
  messageSource: 'go-qr',
  title: 'URL',
  description: 'Create a QR code from any public URL.',
} satisfies GoQrToolContract
