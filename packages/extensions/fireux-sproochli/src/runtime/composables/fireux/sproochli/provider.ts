export const SPROOCHLI_PROVIDER_DEV_URL = 'http://localhost:3011'
export const SPROOCHLI_PROVIDER_PROD_URL = 'https://sproochli.web.app'

export function sproochliProviderBaseUrl() {
  return import.meta.dev ? SPROOCHLI_PROVIDER_DEV_URL : SPROOCHLI_PROVIDER_PROD_URL
}

export function sproochliProviderUrl(path: string) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`
  return `${sproochliProviderBaseUrl()}${cleanPath}`
}

export type SproochliMenuTranslationField = {
  id: string
  sourceText: string
}

export type SproochliMenuTranslation = {
  cache_id?: string
  language?: string
  provider?: string
  text?: string
}

export type SproochliMenuTranslateResponse = {
  fields?: Array<{
    id?: string
    source_hash?: string
    source_text?: string
    translations?: SproochliMenuTranslation[]
  }>
  failures?: Array<{
    field_id?: string
    language?: string
    message?: string
  }>
  glossary_version?: string
}

export async function requestSproochliMenuTranslations(input: {
  sourceLanguage: string
  targetLanguages: string[]
  fields: SproochliMenuTranslationField[]
}) {
  const response = await fetch(sproochliProviderUrl('/api/tools/menu/translate'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sourceLanguage: input.sourceLanguage,
      targetLanguages: input.targetLanguages,
      fields: input.fields,
    }),
  })

  if (!response.ok) {
    throw new Error(`Sproochli translation request failed: ${response.status}`)
  }

  return await response.json() as SproochliMenuTranslateResponse
}
