import { computed } from 'vue'
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'
import {
  requestSproochliMenuTranslations,
  type SproochliMenuTranslateResponse,
} from 'fireux-sproochli/runtime/sproochli'
import type { Menu } from '../../../../../models/menu.model'
import { useKitchenConsoleMenus } from './useKitchenConsoleMenus'

export type KitchenMenuSproochliField = 'name' | 'description'

export type KitchenMenuSproochliSyncResult = {
  field?: KitchenMenuSproochliField
  skipped?: 'disabled' | 'missing-menu' | 'unpublished'
  attached_languages?: string[]
  cache_languages?: string[]
  cache_written?: string[]
  cache_deleted?: number
  failures?: Array<{ language?: string; message?: string }>
}

const CACHE_COLLECTION = 'translation_cache'
const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeSproochliLanguage(value)
const uniqueLanguages = (value: unknown[]) =>
  [...new Set(value.map(normalizeLanguageCode).filter(Boolean))]

const fieldMap: Record<KitchenMenuSproochliField, 'names' | 'descriptions'> = {
  name: 'names',
  description: 'descriptions',
}

export function useKitchenMenuSproochliSync() {
  const {
    selectedKitchen,
    collectionPath,
    databaseId,
    kitchenId,
    updateMenu,
  } = useKitchenConsoleMenus()
  const resolveDb = useFirestoreResolver(databaseId)
  const { appId } = useFireUXConfig()

  const languageSettings = computed(() => selectedKitchen.value?.language_settings ?? {})
  const sproochliEnabled = computed(() => selectedKitchen.value?.sproochli_enabled === true)
  const attachedLanguages = computed(() =>
    Array.isArray(languageSettings.value.attached_languages)
      ? uniqueLanguages(languageSettings.value.attached_languages)
      : []
  )
  const cacheLanguages = computed(() =>
    Array.isArray(languageSettings.value.cache_languages)
      ? uniqueLanguages(languageSettings.value.cache_languages)
      : []
  )
  const hasTranslationTargets = computed(
    () => Boolean(attachedLanguages.value.length || cacheLanguages.value.length)
  )
  const canSyncSproochli = computed(
    () => sproochliEnabled.value && hasTranslationTargets.value
  )

  const sourceLanguageFor = (menu: Menu) =>
    normalizeSproochliLanguage(menu.source_language) ||
    normalizeSproochliLanguage(languageSettings.value.default_language) ||
    'en'

  const sourceTextFor = (menu: Menu, field: KitchenMenuSproochliField) =>
    field === 'description'
      ? normalizeString(menu.description)
      : normalizeString(menu.name)

  async function writeSproochliTranslation(input: {
    field: KitchenMenuSproochliField
    menuId: string
    response: SproochliMenuTranslateResponse
    sourceLanguage: string
    sourceText: string
  }): Promise<KitchenMenuSproochliSyncResult> {
    const db = resolveDb()
    const user = await useRequireUser()
    const menuCollectionPath = normalizeString(collectionPath.value)
    const menuDocPath = menuCollectionPath && input.menuId
      ? `${menuCollectionPath}/${input.menuId}`
      : ''
    if (!menuDocPath) throw new Error('Menu path is required.')

    const fieldId = `menu:${input.menuId}:${input.field}`
    const responseField = input.response.fields?.find(
      (entry) => normalizeString(entry.id) === fieldId
    )
    const translations = responseField?.translations ?? []
    const translationByLanguage = new Map(
      translations.map((entry) => [normalizeLanguageCode(entry.language), entry])
    )
    const failures = (input.response.failures ?? [])
      .filter((failure) => normalizeString(failure.field_id) === fieldId)
      .map((failure) => ({
        language: normalizeLanguageCode(failure.language),
        message: normalizeString(failure.message),
      }))
    const batch = writeBatch(db)
    const attachedPatch: Record<string, string> = {}
    const cacheWritten: string[] = []
    let cacheDeleted = 0
    let ops = 0

    for (const language of attachedLanguages.value) {
      const translation = translationByLanguage.get(language)
      if (!translation) continue
      const translatedText = normalizeString(translation.text)
      if (!input.sourceText || translatedText) attachedPatch[language] = translatedText
    }

    if (Object.keys(attachedPatch).length) {
      batch.set(
        doc(db, menuDocPath),
        {
          [fieldMap[input.field]]: attachedPatch,
          updated: {
            at: serverTimestamp(),
            by: user.uid,
          },
        },
        { merge: true }
      )
      ops += 1
    }

    for (const language of cacheLanguages.value) {
      const translation = translationByLanguage.get(language)
      const cacheId = normalizeString(translation?.cache_id)
      if (!cacheId) continue

      const cacheRef = doc(db, `${menuDocPath}/${CACHE_COLLECTION}/${cacheId}`)
      if (!input.sourceText) {
        batch.delete(cacheRef)
        cacheDeleted += 1
        ops += 1
        continue
      }

      const translatedText = normalizeString(translation?.text)
      if (!translatedText) continue

      batch.set(cacheRef, {
        id: cacheId,
        field_id: fieldId,
        domain: 'restaurant_menu',
        glossary_version: normalizeString(input.response.glossary_version) ||
          DEFAULT_GLOSSARY_VERSION,
        source_language: input.sourceLanguage,
        target_language: language,
        source_text: input.sourceText,
        translated_text: translatedText,
        provider: normalizeString(translation?.provider) || 'sproochli',
        source_hash: normalizeString(responseField?.source_hash),
        usage_count: 1,
        reviewed: false,
        created: {
          at: serverTimestamp(),
          by: user.uid,
          app_id: appId,
        },
        updated: {
          at: serverTimestamp(),
          by: user.uid,
        },
      })
      cacheWritten.push(language)
      ops += 1
    }

    if (ops > 0) await batch.commit()

    return {
      field: input.field,
      attached_languages: attachedLanguages.value,
      cache_languages: cacheLanguages.value,
      cache_written: cacheWritten,
      cache_deleted: cacheDeleted,
      failures,
    }
  }

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

    const sourceLanguage = sourceLanguageFor(menu)
    const sourceText = input.sourceText ?? sourceTextFor(menu, input.field)
    const response = await requestSproochliMenuTranslations({
      sourceLanguage,
      targetLanguages: uniqueLanguages([
        ...attachedLanguages.value,
        ...cacheLanguages.value,
      ]),
      fields: [
        {
          id: `menu:${menuId}:${input.field}`,
          sourceText,
        },
      ],
    })

    return await writeSproochliTranslation({
      field: input.field,
      menuId,
      response,
      sourceLanguage,
      sourceText,
    })
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
