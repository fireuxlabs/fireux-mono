import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
} from './sproochliTranslate'
import {
  restaurantMenuFieldKind,
  restaurantMenuGlossaryHints,
} from './restaurantMenuContext'

function cleanAiOutput(value: unknown) {
  return normalizeSproochliText(value)
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .trim()
}

export async function translateSproochliMenuFieldWithAi(
  event: H3Event,
  input: {
    fieldId: string
    sourceText: string
    sourceLanguage: string
    targetLanguage: string
    glossaryVersion: string
  }
) {
  const sourceText = normalizeSproochliText(input.sourceText)
  const sourceLanguage = normalizeSproochliLanguageCode(input.sourceLanguage)
  const targetLanguage = normalizeSproochliLanguageCode(input.targetLanguage)
  if (!sourceText || !sourceLanguage || !targetLanguage) return null

  const ai = useFireuxAi(event)
  const response = await ai.generateText({
    appId: 'sproochli',
    task: 'translate_text',
    input: {
      text: sourceText,
      sourceLanguage,
      targetLanguage,
    },
    locale: targetLanguage,
    context: {
      domain: 'restaurant_menu',
      fieldId: input.fieldId,
      fieldKind: restaurantMenuFieldKind(input.fieldId),
      glossaryVersion: input.glossaryVersion,
      glossaryHints: restaurantMenuGlossaryHints({
        sourceText,
        targetLanguage,
      }),
      instruction:
        'Translate this as restaurant menu copy. Preserve dish names when appropriate. Use menu context, so Karte in a menu title means menu, not map. Return only the translated text.',
    },
  })
  const translatedText = cleanAiOutput(response.text || response.data)

  if (!response.ok || !translatedText) return null

  return {
    text: translatedText,
    provider: response.provider ? `fireux-ai:${response.provider}` : 'fireux-ai',
  }
}
