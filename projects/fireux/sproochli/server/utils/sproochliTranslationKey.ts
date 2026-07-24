import { createHash } from 'node:crypto'

const text = (value: unknown) => String(value ?? '').trim()
const language = (value: unknown) =>
  text(value).replace(/_/g, '-').toLowerCase()

export function makeSproochliSourceHash(sourceText: string) {
  return createHash('sha256').update(text(sourceText), 'utf8').digest('hex')
}

export function makeSproochliMenuCacheKey(input: {
  cacheVersion: string
  domain: string
  fieldKind: string
  sourceHash: string
  sourceLanguage: string
  targetLanguage: string
  glossaryVersion: string
}) {
  const cacheVersion = text(input.cacheVersion)
  const domain = text(input.domain)
  const fieldKind = text(input.fieldKind)
  const sourceHash = text(input.sourceHash).toLowerCase()
  const sourceLanguage = language(input.sourceLanguage)
  const targetLanguage = language(input.targetLanguage)
  const glossaryVersion = text(input.glossaryVersion)
  if (
    !cacheVersion ||
    !domain ||
    !fieldKind ||
    !sourceHash ||
    !sourceLanguage ||
    !targetLanguage ||
    !glossaryVersion
  ) {
    return ''
  }

  const hash = createHash('sha256')
    .update(
      [
        cacheVersion,
        domain,
        fieldKind,
        sourceHash,
        sourceLanguage,
        targetLanguage,
        glossaryVersion,
      ].join('\n'),
      'utf8'
    )
    .digest('hex')

  return `${targetLanguage}__${hash.slice(0, 40)}`
}
