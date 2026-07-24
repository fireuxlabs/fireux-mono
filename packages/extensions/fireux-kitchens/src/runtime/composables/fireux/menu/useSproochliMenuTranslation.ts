import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute } from '#imports'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  requestSproochliMenuTranslations,
  type SproochliLanguageCode,
  type SproochliMenuTranslationField,
} from 'fireux-sproochli/runtime/sproochli'
import {
  isMenuBrowseSurfaceCopyField,
  MENU_BROWSE_SURFACE_COPY_FIELDS,
  MENU_SURFACE_COPY_VERSION,
  resolveMenuBrowseSurfaceCopy,
} from '../../../content/menu-surface-copy'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'

const MAX_FIELDS_PER_REQUEST = 100
type CachedLanguage = Exclude<SproochliLanguageCode, ''>
const surfaceCopyCache = new Map<string, Map<string, string>>()
const surfaceCopyCacheKey = (language: CachedLanguage) =>
  `${MENU_SURFACE_COPY_VERSION}:${language}`
const text = (value: unknown) => String(value ?? '').trim()
const fieldSegment = (value: unknown) =>
  text(value).replace(/[^A-Za-z0-9_-]+/g, '-') || 'unknown'
const menuFieldKey = (menu: MenuManifest) => `menu:${fieldSegment(menu.content.id)}`
const dishFieldKey = (sectionId: string, itemId: string) =>
  `dish:${fieldSegment(sectionId)}__${fieldSegment(itemId)}`

function menuTranslationFields(
  menu: MenuManifest
): SproochliMenuTranslationField[] {
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

const menuSourceKey = (menu: MenuManifest | null | undefined) =>
  menu
    ? JSON.stringify({
        source: menu.source,
        content: menu.content,
      })
    : ''

export function useSproochliMenuTranslation(input: {
  menu: Ref<MenuManifest | null | undefined> | ComputedRef<MenuManifest | null | undefined>
}) {
  const route = useRoute()
  const sproochli = computed(() => input.menu.value?.sproochli || null)
  const enabled = computed(() => sproochli.value?.enabled === true)
  const sourceKey = computed(() => menuSourceKey(input.menu.value))
  const cachedLanguages = ref<CachedLanguage[]>([])
  const selectedLanguage = computed<SproochliLanguageCode>(() => {
    if (!enabled.value) return ''

    const requested = normalizeSproochliLanguage(route.query.sproochli)
    return sproochli.value?.languageOptions.some(
      option => option.code === requested
    )
      ? requested
      : ''
  })
  const languageOptions = computed(() => {
    const cached = new Set<SproochliLanguageCode>(cachedLanguages.value)

    return (sproochli.value?.languageOptions ?? []).map(option =>
      cached.has(option.code)
        ? {
            ...option,
            source: 'cache' as const,
          }
        : option
    )
  })
  const defaultLanguage = computed(() =>
    text(sproochli.value?.defaultLanguage).toLowerCase()
  )
  const translating = ref(false)
  const translationError = ref('')
  const translated = ref<MenuManifest | null>(null)
  const surfaceTranslations = ref<Map<string, string> | null>(null)
  const cache = new Map<CachedLanguage, Map<string, string>>()
  let requestId = 0
  let activeSourceKey = ''

  watch(
    [sourceKey, selectedLanguage, enabled],
    async (values: [string, SproochliLanguageCode, boolean]) => {
      const [nextSourceKey, language, isEnabled] = values
      const menu = input.menu.value
      const currentRequest = ++requestId
      if (nextSourceKey !== activeSourceKey) {
        activeSourceKey = nextSourceKey
        cache.clear()
        cachedLanguages.value = []
      }
      translationError.value = ''
      translated.value = null

      if (!import.meta.client || !isEnabled || !menu || !language) {
        surfaceTranslations.value = null
        translating.value = false
        return
      }

      const cachedLanguage = language as CachedLanguage
      const cachedSurfaceTranslations =
        surfaceCopyCache.get(surfaceCopyCacheKey(cachedLanguage)) ?? null
      surfaceTranslations.value = cachedSurfaceTranslations
      const cached = cache.get(cachedLanguage)
      if (cached) {
        translated.value = translatedMenu(menu, cached)
        translating.value = false
        return
      }

      translating.value = true
      try {
        const translatedFields = new Map<string, string>()
        const menuFields = menuTranslationFields(menu)
        const sourceFields: SproochliMenuTranslationField[] = [
          ...menuFields,
          ...(
            cachedSurfaceTranslations
              ? []
              : MENU_BROWSE_SURFACE_COPY_FIELDS.map(field => ({
                  id: field.id,
                  sourceText: field.sourceText,
                }))
          ),
        ]
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

        const translatedMenuFields = new Map(
          [...translatedFields].filter(
            ([id]) => !isMenuBrowseSurfaceCopyField(id)
          )
        )
        const translatedSurfaceFields = new Map(
          [...translatedFields].filter(
            ([id]) => isMenuBrowseSurfaceCopyField(id)
          )
        )

        if (menuFields.length && !translatedMenuFields.size) {
          throw new Error('Sproochli returned no menu translations.')
        }

        if (currentRequest !== requestId) return
        const result = translatedMenu(menu, translatedMenuFields)
        cache.set(cachedLanguage, translatedMenuFields)
        if (translatedSurfaceFields.size) {
          surfaceCopyCache.set(
            surfaceCopyCacheKey(cachedLanguage),
            translatedSurfaceFields
          )
          surfaceTranslations.value = translatedSurfaceFields
        }
        cachedLanguages.value = [
          ...new Set([...cachedLanguages.value, cachedLanguage]),
        ]
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
    defaultLanguage,
    languageOptions,
    selectedLanguage,
    cachedLanguages,
    translating,
    translationError,
    menu: computed(() => translated.value || input.menu.value || null),
    surfaceCopy: computed(() =>
      resolveMenuBrowseSurfaceCopy(surfaceTranslations.value)
    ),
    direction: computed(() =>
      isSproochliRtlLanguage(selectedLanguage.value) ? 'rtl' : 'ltr'
    ),
  }
}
