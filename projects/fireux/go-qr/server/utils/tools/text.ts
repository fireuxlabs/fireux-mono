import type { GoQrToolContract } from './types'

export const textTool = {
  id: 'text',
  provider: 'go-qr',
  messageSource: 'go-qr',
  title: 'Text',
  description: 'Turn a short message into a shareable QR.',
  message: 'hello world',
} satisfies GoQrToolContract
