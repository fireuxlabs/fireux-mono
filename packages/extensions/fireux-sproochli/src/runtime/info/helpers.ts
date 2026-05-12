import type {
  InfoDirection,
  InfoLanguageCode,
  InfoLanguageMode,
  InfoPage,
  InfoPageTranslationCache,
  LocalizedTextMap,
  Place,
  PublicInfoPageResponse,
} from './types'

export const DEFAULT_RTL_INFO_LANGUAGES = ['ar', 'fa', 'he', 'ur'] as const

export function normalizeInfoLanguage(
  input: unknown,
  options: {
    fallback?: InfoLanguageCode
    supportedLanguages?: readonly InfoLanguageCode[]
  } = {}
): InfoLanguageCode {
  const fallback = String(options.fallback || 'en').trim().toLowerCase() || 'en'
  const normalized = String(input || '').trim().toLowerCase()
  const language = normalized || fallback

  if (!options.supportedLanguages?.length) return language

  const supported = new Set(
    options.supportedLanguages.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean)
  )

  return supported.has(language) ? language : fallback
}

export function isRtlLanguage(language: unknown): boolean {
  const normalized = normalizeInfoLanguage(language)
  return DEFAULT_RTL_INFO_LANGUAGES.includes(normalized as any)
}

export function getInfoDirection(language: unknown): InfoDirection {
  return isRtlLanguage(language) ? 'rtl' : 'ltr'
}

export function resolveLocalizedText(
  defaultText: string,
  certifiedMap: LocalizedTextMap | undefined,
  cacheMap: LocalizedTextMap | undefined,
  language: InfoLanguageCode
): {
  text: string
  source: InfoLanguageMode
} {
  const normalized = normalizeInfoLanguage(language)
  const cached = cacheMap?.[normalized]
  if (typeof cached === 'string' && cached.trim()) {
    return { text: cached, source: 'cached' }
  }

  const certified = certifiedMap?.[normalized]
  if (typeof certified === 'string' && certified.trim()) {
    return { text: certified, source: 'certified' }
  }

  return { text: defaultText, source: 'original' }
}

function strongestInfoLanguageMode(
  current: InfoLanguageMode,
  next: InfoLanguageMode
): InfoLanguageMode {
  if (current === 'cached' || next === 'cached') return 'cached'
  if (current === 'certified' || next === 'certified') return 'certified'
  return 'original'
}

export function resolveInfoPageForLanguage(
  page: InfoPage,
  language: InfoLanguageCode,
  cache?: InfoPageTranslationCache
): {
  page: PublicInfoPageResponse['page']
  translation_source: InfoLanguageMode
} {
  const normalizedLanguage = normalizeInfoLanguage(language, {
    fallback: page.original_language,
  })
  const cacheForLanguage = cache?.language === normalizedLanguage ? cache : undefined
  let translationSource: InfoLanguageMode = 'original'

  const title = resolveLocalizedText(
    page.title,
    page.titles,
    cacheForLanguage?.title ? { [normalizedLanguage]: cacheForLanguage.title } : undefined,
    normalizedLanguage
  )
  translationSource = strongestInfoLanguageMode(translationSource, title.source)

  const description = resolveLocalizedText(
    page.description,
    page.descriptions,
    cacheForLanguage?.description ? { [normalizedLanguage]: cacheForLanguage.description } : undefined,
    normalizedLanguage
  )
  translationSource = strongestInfoLanguageMode(translationSource, description.source)

  const sections = [...page.sections]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((section) => {
      const cachedSection = cacheForLanguage?.sections?.[section.id]
      const sectionTitle = resolveLocalizedText(
        section.title,
        section.titles,
        cachedSection?.title ? { [normalizedLanguage]: cachedSection.title } : undefined,
        normalizedLanguage
      )
      translationSource = strongestInfoLanguageMode(translationSource, sectionTitle.source)

      const sectionDescription = resolveLocalizedText(
        section.description || '',
        section.descriptions,
        cachedSection?.description ? { [normalizedLanguage]: cachedSection.description } : undefined,
        normalizedLanguage
      )
      translationSource = strongestInfoLanguageMode(translationSource, sectionDescription.source)

      const blocks = [...section.blocks]
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((block) => {
          const cachedBlock = cachedSection?.blocks?.[block.id]
          const blockTitle = resolveLocalizedText(
            block.title || '',
            block.titles,
            cachedBlock?.title ? { [normalizedLanguage]: cachedBlock.title } : undefined,
            normalizedLanguage
          )
          translationSource = strongestInfoLanguageMode(translationSource, blockTitle.source)

          const blockBody = resolveLocalizedText(
            block.body,
            block.bodies,
            cachedBlock?.body ? { [normalizedLanguage]: cachedBlock.body } : undefined,
            normalizedLanguage
          )
          translationSource = strongestInfoLanguageMode(translationSource, blockBody.source)

          return {
            id: block.id,
            type: block.type,
            title: blockTitle.text,
            body: blockBody.text,
            sort_order: block.sort_order,
          }
        })

      return {
        id: section.id,
        title: sectionTitle.text,
        description: sectionDescription.text,
        blocks,
        sort_order: section.sort_order,
      }
    })

  return {
    page: {
      ...page,
      title: title.text,
      description: description.text,
      sections,
    },
    translation_source: translationSource,
  }
}

export function buildPublicInfoResponse(
  place: Place,
  page: InfoPage,
  requestedLanguage: unknown,
  cache?: InfoPageTranslationCache
): PublicInfoPageResponse {
  const language = normalizeInfoLanguage(requestedLanguage, {
    fallback: page.original_language,
    supportedLanguages: place.supported_languages,
  })
  const resolved = resolveInfoPageForLanguage(page, language, cache)

  return {
    place,
    page: resolved.page,
    language,
    requested_language: String(requestedLanguage || ''),
    direction: getInfoDirection(language),
    translation_source: resolved.translation_source,
  }
}
