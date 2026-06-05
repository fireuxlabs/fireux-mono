import type { SproochliToolContract } from './types'

export const languageTriggerTool = {
  id: 'language-trigger',
  provider: 'sproochli',
  title: 'Language trigger',
  description: 'Preview the public menu language selector.',
  messageSource: 'sproochli',
  inputs: [
    'selectedLanguage',
    'defaultLanguage',
    'attachedLanguages',
    'cachedLanguages',
    'publicLanguages',
    'onDemandLanguages',
    'showGroupLabels',
  ],
  outputs: [
    'selected language URL',
  ],
} satisfies SproochliToolContract
