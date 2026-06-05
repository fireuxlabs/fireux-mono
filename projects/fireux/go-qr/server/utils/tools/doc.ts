import type { GoQrToolContract } from './types'

export const docTool = {
  id: 'doc',
  provider: 'go-qr',
  messageSource: 'go-qr',
  title: 'Doc',
  description: 'Upload a doc, choose a short path, and get a QR page.',
  endpoints: {
    create: '/api/tools/doc/create',
    availability: '/api/tools/doc/availability',
  },
  preview: {
    base_url: 'https://go-qr.web.app/doc',
    path_suffix: '/qr',
  },
} satisfies GoQrToolContract
