import { computed, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

const text = (value: unknown) => String(value ?? '').trim()
type TranslationCacheRow = {
  field_id?: unknown
  target_language?: unknown
  translated_text?: unknown
}

export function useKitchenPublicMenuTranslations(
  menuCollectionPath: Ref<string>,
  menuId: Ref<string>,
  selectedLanguage: Ref<unknown>
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = computed(() =>
    menuCollectionPath.value && menuId.value
      ? `${menuCollectionPath.value}/${menuId.value}/translation_cache`
      : ''
  )
  const cacheDocs = firestoreFetchCollection<TranslationCacheRow>(collectionPath)
  const rows = computed<Record<string, string>>(() =>
    Object.fromEntries(
      (cacheDocs.value ?? [])
        .filter((doc) => text(doc.target_language) === text(selectedLanguage.value))
        .map((doc) => [text(doc.field_id), text(doc.translated_text)])
        .filter(([fieldId, value]) => fieldId && value)
    )
  )
  const pending = computed(
    () => Boolean(collectionPath.value && selectedLanguage.value) && cacheDocs.value === undefined
  )

  return {
    rows,
    pending,
    text: (fieldId: string) => rows.value[fieldId] ?? '',
  }
}
