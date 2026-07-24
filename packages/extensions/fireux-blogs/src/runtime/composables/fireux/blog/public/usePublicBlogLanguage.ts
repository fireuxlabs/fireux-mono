import { useCookie, useRoute, useRuntimeConfig } from '#imports'
import { computed, watch } from 'vue'

const languageCode = (value: unknown) => {
  const candidate = Array.isArray(value) ? value[0] : value
  const language = String(candidate ?? '')
    .trim()
    .replace(/_/g, '-')
    .toLowerCase()
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(language)
    ? language
    : ''
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function usePublicBlogLanguage() {
  const route = useRoute()
  const runtime = useRuntimeConfig()
  const fireux = record(runtime.public?.fireux)
  const blogs = record(fireux.blogs)
  const languages = Array.isArray(blogs.languages)
    ? blogs.languages.map(languageCode).filter(Boolean)
    : []
  const defaultLanguage = languageCode(blogs.defaultLanguage)
  const queryParameter =
    String(blogs.queryParameter ?? '').trim() || 'language'
  const selectionCookie =
    String(blogs.selectionCookie ?? '').trim() || 'fireux.blogs.language'
  const storedLanguage = useCookie<string>(selectionCookie, {
    default: () => defaultLanguage,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const requestedLanguage = computed(() =>
    languageCode(route.query[queryParameter])
  )
  const isAllowed = (language: string) =>
    Boolean(language) && (!languages.length || languages.includes(language))

  watch(
    requestedLanguage,
    (language) => {
      if (isAllowed(language) && storedLanguage.value !== language) {
        storedLanguage.value = language
      }
    },
    { immediate: true }
  )

  const language = computed(() => {
    if (isAllowed(requestedLanguage.value)) return requestedLanguage.value
    const stored = languageCode(storedLanguage.value)
    if (isAllowed(stored)) return stored
    return defaultLanguage
  })

  return {
    language,
    query: computed(() =>
      language.value ? { language: language.value } : {}
    ),
  }
}
