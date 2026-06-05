import type { SproochliToolContract } from './types'

export const menuTool = {
  id: 'menu',
  provider: 'sproochli',
  title: 'Menu translation',
  description: 'Translate menu copy for a consuming app.',
  messageSource: 'sproochli',
  endpoints: {
    translate: '/api/tools/menu/translate',
  },
  inputs: [
    'publicMenuUrl',
    'kitchenSlug',
    'menuId',
    'sourceLanguage',
    'targetLanguages',
    'fields',
  ],
  outputs: [
    'translations',
    'cache ids',
    'source hashes',
  ],
} satisfies SproochliToolContract
