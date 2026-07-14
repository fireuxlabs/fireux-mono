import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  requestSproochliMenuTranslations,
  resolveSproochliLanguageState,
  type SproochliLanguageCode,
  type SproochliMenuTranslationField,
} from 'fireux-sproochli/runtime/sproochli'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'

const MAX_FIELDS_PER_REQUEST = 100
const text = (value: unknown) => String(value ?? '').trim()
const fieldSegment = (value: unknown) =>
  text(value).replace(/[^A-Za-z0-9_-]+/g, '-') || 'unknown'
const menuFieldKey = (menu: MenuManifest) => `menu:${fieldSegment(menu.content.id)}`
const dishFieldKey = (sectionId: string, itemId: string) =>
  `dish:${fieldSegment(sectionId)}__${fieldSegment(itemId)}`

function translationFields(menu: MenuManifest): SproochliMenuTranslationField[] {
  const menuKey = menuFieldKey(menu)
  const fields: SproochliMenuTranslationField[] = [
    { id: `${menuKey}:name`, sourceText: text(menu.content.name) },
    { id: `${menuKey}:description`, sourceText: text(menu.content.description) },
  ]

  menu.content.sections.forEach((section) => {
    fields.push({
      id: `section:${section.id}:label`,
      sourceText: text(section.label),
    })

    section.items.forEach((item) => {
      const itemKey = dishFieldKey(section.id, item.id)
      fields.push(
        { id: `${itemKey}:name`, sourceText: text(item.name) },
        { id: `${itemKey}:description`, sourceText: text(item.description) }
      )
      item.priceOptions.forEach((option) => {
        fields.push({
          id: `${itemKey}:price-option:${option.id}:label`,
          sourceText: text(option.label),
        })
      })
      item.addOns.forEach((option) => {
        fields.push({
          id: `${itemKey}:add-on:${option.id}:label`,
          sourceText: text(option.label),
        })
      })
    })
  })

  return fields.filter((field) => field.sourceText)
}

function translatedMenu(
  menu: MenuManifest,
  translations: Map<string, string>
): MenuManifest {
  const translated = (id: string, fallback: string) =>
    text(translations.get(id)) || fallback
  const menuKey = menuFieldKey(menu)

  return {
    ...menu,
    content: {
      ...menu.content,
      name: translated(`${menuKey}:name`, menu.content.name),
      description: translated(`${menuKey}:description`, menu.content.description),
      sections: menu.content.sections.map((section) => ({
        ...section,
        label: translated(`section:${section.id}:label`, section.label),
        items: section.items.map((item) => {
          const itemKey = dishFieldKey(section.id, item.id)
          return {
            ...item,
            name: translated(`${itemKey}:name`, item.name),
            description: translated(`${itemKey}:description`, item.description),
            priceOptions: item.priceOptions.map((option) => ({
              ...option,
              label: translated(
                `${itemKey}:price-option:${option.id}:label`,
                option.label
              ),
            })),
            addOns: item.addOns.map((option) => ({
              ...option,
              label: translated(
                `${itemKey}:add-on:${option.id}:label`,
                option.label
              ),
            })),
          }
        }),
      })),
    },
  }
}

const chunks = <T>(values: T[], size: number) => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size))
  }
  return result
}

export function useSproochliMenuTranslation(input: {
  menu: Ref<MenuManifest | null | undefined> | ComputedRef<MenuManifest | null | undefined>
}) {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const sproochliConfig = computed(() => {
    const value = (runtimeConfig.public as Record<string, any>)?.fireux?.sproochli
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
  })
  const enabled = computed(() => sproochliConfig.value.enabled === true)
  const languageState = computed(() =>
    resolveSproochliLanguageState({
      ...sproochliConfig.value,
      enabled: enabled.value,
    })
  )
  const selectedLanguage = computed<SproochliLanguageCode>(() =>
    enabled.value ? normalizeSproochliLanguage(route.query.sproochli) : ''
  )
  const translating = ref(false)
  const translationError = ref('')
  const translated = ref<MenuManifest | null>(null)
  const cache = new Map<string, MenuManifest>()
  let requestId = 0

  watch(
    () => input.menu.value,
    () => {
      cache.clear()
      translated.value = null
    }
  )

  watch(
    [() => input.menu.value, selectedLanguage, enabled],
    async (values: [MenuManifest | null | undefined, SproochliLanguageCode, boolean]) => {
      const [menu, language, isEnabled] = values
      const currentRequest = ++requestId
      translationError.value = ''

      if (!import.meta.client || !isEnabled || !menu || !language) {
        translated.value = null
        translating.value = false
        return
      }

      const cached = cache.get(language)
      if (cached) {
        translated.value = cached
        translating.value = false
        return
      }

      translating.value = true
      try {
        const translatedFields = new Map<string, string>()
        const sourceFields = translationFields(menu)
        const fieldGroups = chunks(sourceFields, MAX_FIELDS_PER_REQUEST)

        for (const fields of fieldGroups) {
          const response = await requestSproochliMenuTranslations({
            sourceLanguage: 'auto',
            targetLanguages: [language],
            fields,
          })
          response.fields?.forEach((field) => {
            const value = field.translations?.find(
              (entry) => entry.language === language
            )?.text
            if (field.id && text(value)) translatedFields.set(field.id, text(value))
          })
        }

        if (sourceFields.length && !translatedFields.size) {
          throw new Error('Sproochli returned no menu translations.')
        }

        if (currentRequest !== requestId) return
        const result = translatedMenu(menu, translatedFields)
        cache.set(language, result)
        translated.value = result
      } catch (error) {
        if (currentRequest !== requestId) return
        translated.value = null
        translationError.value = error instanceof Error
          ? error.message
          : 'Menu translation failed.'
      } finally {
        if (currentRequest === requestId) translating.value = false
      }
    },
    { immediate: true }
  )

  return {
    enabled,
    languageOptions: computed(() => languageState.value.options),
    selectedLanguage,
    translating,
    translationError,
    menu: computed(() => translated.value || input.menu.value || null),
    direction: computed(() =>
      isSproochliRtlLanguage(selectedLanguage.value) ? 'rtl' : 'ltr'
    ),
  }
}
