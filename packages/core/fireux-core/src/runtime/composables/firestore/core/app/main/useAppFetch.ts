// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { computed, isRef } from 'vue'
import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

/**
 * Fetch a single app document by id.
 * Accepts raw ids or reactive refs/computed wrappers.
 */
export function useAppFetch(
  appId: string | null | undefined | Ref<string | null | undefined>
) {
  const db = useFirestore()

  const targetId = computed(() => {
    const value = isRef(appId) ? appId.value : appId
    return value ?? null
  })

  const docRef = computed(() =>
    targetId.value ? (doc(db, 'apps', targetId.value) as any) : null
  )

  const { data: app } = useDocument<App | undefined>(docRef as any)
  return { app }
}
