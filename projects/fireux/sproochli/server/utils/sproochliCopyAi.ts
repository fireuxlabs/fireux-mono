import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server.ts'
import { normalizeSproochliText } from './sproochliTranslate'

export async function draftSproochliCopyWithAi(
  event: H3Event,
  input: {
    key: string
    sourceText: string
    profileId: string
    locale: string
    region: string
    style: string
    glossary: Record<string, string>
  }
) {
  const ai = useFireuxAi(event)
  const response = await ai.generateText({
    appId: 'sproochli',
    task: 'translate_text',
    input: {
      text: input.sourceText,
      sourceLanguage: 'en',
      targetLanguage: 'gsw',
    },
    locale: input.locale,
    context: {
      domain: 'reviewed_brand_copy',
      key: input.key,
      profileId: input.profileId,
      region: input.region,
      style: input.style,
      glossary: input.glossary,
      instruction:
        'Draft readable Swiss German for the named regional profile. Preserve intent, follow the glossary exactly where relevant, avoid Standard German and dialect theatre, and return only the draft copy.',
    },
  })
  const text = normalizeSproochliText(response.text || response.data)
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .trim()

  if (!response.ok || !text) return null
  return {
    text,
    provider: response.provider ? `fireux-ai:${response.provider}` : 'fireux-ai',
  }
}
