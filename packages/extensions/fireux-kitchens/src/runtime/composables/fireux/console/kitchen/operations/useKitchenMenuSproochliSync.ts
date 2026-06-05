import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

export type KitchenMenuSproochliField = 'name' | 'description'

export type KitchenMenuSproochliSyncResult = {
  field?: KitchenMenuSproochliField
  skipped?: 'disabled' | 'missing-menu' | 'unpublished'
  failures?: Array<{ language?: string; message?: string }>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenMenuSproochliSync() {
  const {
    selectedKitchen,
    rootCollection,
    kitchenId,
    updateMenu,
  } = useKitchenConsoleMenus()

  const languageSettings = computed(() => selectedKitchen.value?.language_settings ?? {})
  const sproochliEnabled = computed(() => selectedKitchen.value?.sproochli_enabled === true)
  const attachedLanguages = computed(() =>
    Array.isArray(languageSettings.value.attached_languages)
      ? languageSettings.value.attached_languages.map(normalizeString).filter(Boolean)
      : []
  )
  const cacheLanguages = computed(() =>
    Array.isArray(languageSettings.value.cache_languages)
      ? languageSettings.value.cache_languages.map(normalizeString).filter(Boolean)
      : []
  )
  const hasTranslationTargets = computed(
    () => Boolean(attachedLanguages.value.length || cacheLanguages.value.length)
  )
  const canSyncSproochli = computed(
    () => sproochliEnabled.value && hasTranslationTargets.value
  )

  const sourceLanguageFor = (menu: Menu) =>
    normalizeString(menu.source_language) ||
    normalizeString(languageSettings.value.default_language) ||
    'en'

  const sourceTextFor = (menu: Menu, field: KitchenMenuSproochliField) =>
    field === 'description'
      ? normalizeString(menu.description)
      : normalizeString(menu.name)

  async function syncMenuField(input: {
    field: KitchenMenuSproochliField
    force?: boolean
    menu?: Menu | null
    sourceText?: string
  }): Promise<KitchenMenuSproochliSyncResult> {
    const menu = input.menu ?? null
    if (!menu) return { field: input.field, skipped: 'missing-menu' }
    if (!canSyncSproochli.value) return { field: input.field, skipped: 'disabled' }
    if (input.force !== true && menu.status !== 'published') {
      return { field: input.field, skipped: 'unpublished' }
    }

    const menuId = normalizeString(menu.id)
    if (!kitchenId.value || !menuId) {
      throw new Error('No menu selected.')
    }

    return await $fetch<KitchenMenuSproochliSyncResult>(
      '/api/kitchen-menu-translation-sync',
      {
        method: 'POST',
        body: {
          kitchenCollectionPath: rootCollection.value,
          kitchenId: kitchenId.value,
          menuId,
          field: input.field,
          sourceLanguage: sourceLanguageFor(menu),
          sourceText: input.sourceText ?? sourceTextFor(menu, input.field),
          attachedLanguages: attachedLanguages.value,
          cacheLanguages: cacheLanguages.value,
        },
      }
    )
  }

  async function syncMenuTranslations(
    menu: Menu | null | undefined,
    options: { clearRefreshNeeded?: boolean; force?: boolean } = {}
  ) {
    const results = await Promise.all([
      syncMenuField({ menu, field: 'name', force: options.force }),
      syncMenuField({ menu, field: 'description', force: options.force }),
    ])
    const hasFailures = results.some((result) => result.failures?.length)
    const menuId = normalizeString(menu?.id)

    if (options.clearRefreshNeeded && menuId && !hasFailures) {
      await updateMenu(kitchenId.value, menuId, {
        sproochli_refresh_needed: false,
      })
    }

    return results
  }

  async function markMenuNeedsTranslationRefresh(menu: Menu | null | undefined) {
    if (!canSyncSproochli.value) return
    if (menu?.status !== 'published') return

    const menuId = normalizeString(menu.id)
    if (!kitchenId.value || !menuId) return

    await updateMenu(kitchenId.value, menuId, {
      sproochli_refresh_needed: true,
    })
  }

  return {
    sproochliEnabled,
    canSyncSproochli,
    markMenuNeedsTranslationRefresh,
    syncMenuField,
    syncMenuTranslations,
  }
}
