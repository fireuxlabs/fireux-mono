import { computed, watch } from 'vue'
import { useCookie, useRoute } from '#imports'
import {
  INTERLAKEN_SITE_DEFAULT_LANGUAGE,
  INTERLAKEN_SITE_LANGUAGE_OPTIONS,
  isInterlakenSiteLanguageAvailableOnPath,
  normalizeInterlakenSiteLanguage,
  resolveInterlakenSiteLanguage,
  type InterlakenSiteLanguage,
} from '@/content/sproochli-site'

const INTERLAKEN_LANGUAGE_COOKIE = 'interlaken-essen.sproochli'

export function useInterlakenSproochli() {
  const route = useRoute()
  const storedLanguage = useCookie<string>(INTERLAKEN_LANGUAGE_COOKIE, {
    default: () => INTERLAKEN_SITE_DEFAULT_LANGUAGE,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const requestedLanguage = computed(() =>
    normalizeInterlakenSiteLanguage(route.query.sproochli)
  )
  const availableRequestedLanguage = computed(() => {
    const language = requestedLanguage.value

    return language &&
      isInterlakenSiteLanguageAvailableOnPath(language, route.path)
      ? language
      : ''
  })

  watch(
    availableRequestedLanguage,
    (language: InterlakenSiteLanguage | '') => {
      if (language && storedLanguage.value !== language) {
        storedLanguage.value = language
      }
    },
    { immediate: true }
  )

  const selectedLanguage = computed(() => {
    if (availableRequestedLanguage.value) {
      return availableRequestedLanguage.value
    }

    const language =
      resolveInterlakenSiteLanguage(storedLanguage.value)

    return isInterlakenSiteLanguageAvailableOnPath(
      language,
      route.path
    )
      ? language
      : INTERLAKEN_SITE_DEFAULT_LANGUAGE
  })

  return {
    defaultLanguage: INTERLAKEN_SITE_DEFAULT_LANGUAGE,
    languageOptions: INTERLAKEN_SITE_LANGUAGE_OPTIONS,
    selectedLanguage,
  }
}
