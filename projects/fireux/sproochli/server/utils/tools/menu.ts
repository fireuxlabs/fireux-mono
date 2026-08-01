import type { SproochliToolContract } from './types'

export const menuTool = {
  id: 'menu',
  provider: 'sproochli',
  title: 'Menu translation',
  description: 'Translate menu copy for a consuming app.',
  messageSource: 'sproochli',
  endpoints: {
    resolve: '/api/tools/menu',
  },
  inputs: [
    'host',
    'source',
    'fields',
    'language',
  ],
  outputs: [
    'host',
    'language',
    'provider',
    'translations',
  ],
} satisfies SproochliToolContract
