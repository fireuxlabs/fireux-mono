import { computed, ref, watch } from 'vue'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'
import type { Dish } from '../../../../../models/dish.model'
import type { Menu, MenuItem, MenuSection } from '../../../../../models/menu.model'

type ReadableRef<T> = {
  value: T
}

type LanguagePrepareOptions = {
  kitchen: ReadableRef<unknown>
  kitchenSlug: ReadableRef<string>
  menu: ReadableRef<Menu | null>
  menuId: ReadableRef<string>
  selectedLanguage: ReadableRef<unknown>
  pending: ReadableRef<boolean>
  sections: ReadableRef<MenuSection[]>
  items: ReadableRef<MenuItem[]>
  dishesById: ReadableRef<Map<string, Dish>>
  cacheRows: ReadableRef<Record<string, string>>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenPublicMenuLanguagePrepare(
  options: LanguagePrepareOptions
) {
  const preparePending = ref(false)
  const prepareError = ref('')
  const prepareKey = ref('')
  const kitchen = computed(() =>
    options.kitchen.value &&
    typeof options.kitchen.value === 'object' &&
    !Array.isArray(options.kitchen.value)
      ? options.kitchen.value as Record<string, unknown>
      : null
  )

  const sourceLanguage = computed(() =>
    normalizeSproochliLanguage(options.menu.value?.source_language)
  )
  const fieldIds = computed(() => {
    const menu = options.menu.value
    const ids: string[] = []
    const add = (id: string, sourceText: unknown) => {
      if (text(id) && text(sourceText)) ids.push(id)
    }

    if (menu) {
      add(`menu:${text(menu.id)}:name`, menu.name)
      add(`menu:${text(menu.id)}:description`, menu.description)
    }

    for (const section of options.sections.value) {
      const sectionId = text(section.id)
      add(`section:${sectionId}:label`, section.label)
      add(`section:${sectionId}:description`, section.description)
    }

    for (const item of options.items.value) {
      const dishId = text(item.dish_id)
      const dish = options.dishesById.value.get(dishId)
      add(`dish:${dishId}:name`, dish?.name)
      add(`dish:${dishId}:description`, dish?.description)
    }

    return [...new Set(ids)]
  })
  const missingFieldCount = computed(() => {
    const selectedLanguage = options.selectedLanguage.value
    if (!selectedLanguage) return 0
    if (!sourceLanguage.value) return 0
    if (selectedLanguage === sourceLanguage.value) return 0

    return fieldIds.value.filter(
      (fieldId) => !text(options.cacheRows.value[fieldId])
    ).length
  })

  watch(
    () => ({
      enabled: kitchen.value?.sproochli_enabled === true,
      language: options.selectedLanguage.value,
      kitchenSlug: options.kitchenSlug.value,
      menuId: options.menuId.value,
      missingCount: missingFieldCount.value,
      pending: options.pending.value,
    }),
    async ({ enabled, language, kitchenSlug, menuId, missingCount, pending }) => {
      if (import.meta.server) return
      if (!enabled || !language || !kitchenSlug || !menuId || pending) return
      if (missingCount < 1) return

      const requestKey = `${kitchenSlug}:${menuId}:${language}`
      if (prepareKey.value === requestKey) return

      prepareKey.value = requestKey
      preparePending.value = true
      prepareError.value = ''

      try {
        await $fetch('/api/kitchens/public-menu/prepare-language', {
          method: 'POST',
          body: {
            kitchenSlug,
            menuId,
            language,
          },
        })
      } catch (error) {
        prepareError.value = error instanceof Error ? error.message : String(error)
      } finally {
        preparePending.value = false
      }
    },
    { immediate: true }
  )

  return {
    pending: preparePending,
    error: prepareError,
    missingFieldCount,
  }
}
