import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { App } from '../../../../models/core/app.model'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'

/**
 * Lightweight wrapper around Firestore apps collection
 * Aligns with older API shape: { apps, loading, fetchApps }
 */
export function useApps(): {
  apps: Ref<App[] | undefined>
  loading: Ref<boolean>
  fetchApps: () => Promise<void>
} {
  const loading = ref(true)
  const { firestoreFetchCollection } = useFirestoreManager()

  const apps: Ref<App[] | undefined> = import.meta.client
    ? firestoreFetchCollection<App>('apps')
    : (ref([]) as Ref<App[] | undefined>)

  watchEffect(() => {
    if (apps.value !== undefined) loading.value = false
  })

  const fetchApps = async () => {
    // Reactive source already subscribed; keep as no-op placeholder
    await Promise.resolve()
  }

  return { apps, loading, fetchApps }
}
