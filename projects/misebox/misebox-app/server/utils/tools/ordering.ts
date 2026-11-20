import type { MiseboxToolContract } from './types'

export const orderingTool = {
  id: 'ordering',
  provider: 'misebox',
  messageSource: 'misebox',
  title: 'Browse published menus',
  description: 'Browse food, drinks and prices from a published Menu.',
} satisfies MiseboxToolContract
