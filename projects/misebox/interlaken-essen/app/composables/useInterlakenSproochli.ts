import { computed, watch } from 'vue'
import { useCookie, useRoute } from '#imports'
import {
  INTERLAKEN_SITE_DEFAULT_LANGUAGE,
  INTERLAKEN_SITE_LANGUAGE_OPTIONS,
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

  watch(
    requestedLanguage,
    (language: InterlakenSiteLanguage | '') => {
      if (language && storedLanguage.value !== language) {
        storedLanguage.value = language
      }
    },
    { immediate: true }
  )

  const selectedLanguage = computed(() =>
    requestedLanguage.value ||
    resolveInterlakenSiteLanguage(storedLanguage.value)
  )

  return {
    defaultLanguage: INTERLAKEN_SITE_DEFAULT_LANGUAGE,
    languageOptions: INTERLAKEN_SITE_LANGUAGE_OPTIONS,
    selectedLanguage,
  }
}
