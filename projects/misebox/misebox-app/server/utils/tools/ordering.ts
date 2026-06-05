import type { MiseboxToolContract } from './types'

export const orderingTool = {
  id: 'ordering',
  provider: 'misebox',
  messageSource: 'misebox',
  title: 'Misebox ordering',
  description: '',
} satisfies MiseboxToolContract
