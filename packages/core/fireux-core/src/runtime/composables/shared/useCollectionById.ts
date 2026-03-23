import { computed, unref, type Ref } from 'vue'

type WithId = {
  id?: string | number | null | undefined
}

export function useCollectionById<T extends WithId>(
  source: Ref<T[] | null | undefined>
) {
  const byId = (id: string | null | undefined | Ref<string | null | undefined>) =>
    computed<T | null>(() => {
      const resolvedId = String(unref(id) || '').trim()
      if (!resolvedId) return null

      return (
        (source.value ?? []).find(
          (entry) => String(entry?.id ?? '').trim() === resolvedId
        ) ?? null
      )
    })

  return { byId }
}
