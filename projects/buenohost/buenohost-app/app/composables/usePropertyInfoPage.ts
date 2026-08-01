// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: read the sanitized local preview instead of app demo fixtures.
import { computed, ref } from 'vue'
import { setResponseStatus, useRuntimeConfig } from '#imports'
import {
  getPropertyInfoHome,
  getPropertyInfoSections,
  resolvePropertyInfo,
  type PropertyInfoItem,
} from '../simulations/propertyInfo'
import { findSimulatedBuenoHostProperty } from '../simulations/properties'



export function usePropertyInfoPage() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const property = computed(() => findSimulatedBuenoHostProperty(String(route.params.slug || '')))
  const info = computed(() => property.value ? resolvePropertyInfo(property.value.slug) : null)

  if (!info.value) setResponseStatus(404)

  const resolvedProperty = computed(() => property.value!)
  const resolvedInfo = computed(() => info.value!)
  const infoHome = computed(() => getPropertyInfoHome(resolvedInfo.value))
  const infoSections = computed(() => getPropertyInfoSections(resolvedInfo.value))
  const priorityTopics = computed(() => infoSections.value.filter((topic) => topic.priority))
  const regularTopics = computed(() => infoSections.value.filter((topic) => !topic.priority))
  const phoneHref = computed(() => resolvedProperty.value.manual.welcome.phone.replace(/\s+/g, ''))
  const showTranslations = ref(false)
  const translationAvailability = ref<TranslationAvailabilityResponse | null>(null)
  const translationAvailabilityPending = ref(false)
  const translationAvailabilityError = ref('')
  const availableTranslations = computed(() => translationAvailability.value?.available_languages ?? [])

  const sproochliBaseUrl = computed(() => {
    const configured = String(runtimeConfig.public.sproochliBaseUrl || '').trim().replace(/\/+$/, '')
    if (configured) return configured
    return import.meta.dev ? 'http://localhost:3011' : 'https://sproochli.web.app'
  })

  const translationAvailabilityUrl = computed(() => {
    const ref = resolvedInfo.value.translation_ref
    const search = new URLSearchParams({
      source_app: ref.source_app,
      document_type: ref.document_type,
      document_slug: ref.document_slug,
    })
    return `${sproochliBaseUrl.value}/api/public/translations/available?${search.toString()}`
  })

  type PublishedTranslation = {
    code: string
    label?: string
    native_label?: string
    direction?: 'ltr' | 'rtl'
  }

  type TranslationAvailabilityResponse = {
    source_app: string
    document_type: string
    document_slug: string
    source_language: string
    available_languages: PublishedTranslation[]
    translations_ready: boolean
  }

  function sectionPath(infoId: string) {
    return `/properties/${resolvedProperty.value.slug}/info/${infoId}`
  }

  function itemClass(tone: PropertyInfoItem['tone']) {
    if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
    if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
    return 'bg-default text-default'
  }

  async function toggleTranslations() {
    showTranslations.value = !showTranslations.value
    if (!showTranslations.value) return
    if (translationAvailability.value || translationAvailabilityPending.value) return

    await loadTranslationAvailability()
  }

  async function loadTranslationAvailability() {
    translationAvailabilityPending.value = true
    translationAvailabilityError.value = ''

    try {
      const response = await fetch(translationAvailabilityUrl.value)
      if (!response.ok) throw new Error(`Sproochli returned ${response.status}`)
      translationAvailability.value = await response.json() as TranslationAvailabilityResponse
    } catch (error) {
      translationAvailabilityError.value = error instanceof Error
        ? error.message
        : 'Sproochli is not reachable right now.'
    } finally {
      translationAvailabilityPending.value = false
    }
  }

  return {
    availableTranslations,
    infoHome,
    itemClass,
    phoneHref,
    priorityTopics,
    regularTopics,
    resolvedInfo,
    resolvedProperty,
    sectionPath,
    showTranslations,
    toggleTranslations,
    translationAvailability,
    translationAvailabilityError,
    translationAvailabilityPending,
  }
}
