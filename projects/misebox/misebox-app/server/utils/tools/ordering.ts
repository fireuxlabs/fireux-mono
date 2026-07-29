import type { MiseboxToolContract } from './types'

export const orderingTool = {
  id: 'ordering',
  provider: 'misebox',
  messageSource: 'misebox',
  title: 'Order from a published Menu',
  description:
    'Choose a published Menu. Collection, delivery, and pre-order appear only when the Menu and Kitchen enable them.',
} satisfies MiseboxToolContract
