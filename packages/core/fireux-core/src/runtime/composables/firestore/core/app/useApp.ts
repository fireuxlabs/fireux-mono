import { ref, computed, watchEffect } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import { useAppUsers } from './subcollections/useAppUsers.ts'
import { useAppComputed } from './useAppComputed.ts'
import { useAppEnsure } from './useAppEnsure.ts'
import { useAppUpdate } from './useAppUpdate.ts'

export function useApp() {
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreManager()

  // --- Current app document
  const appRef = computed<DocumentReference<App>>(
    () => doc(db, 'apps', appId) as DocumentReference<App>
  )
  const { data: app } = useDocument<App>(appRef)

  // --- Global list (auto for global, lazy for tenants)
  const autoAll =
    role === 'global' ? firestoreFetchCollection<App>('apps') : null

  const lazyAll = ref<ReturnType<typeof firestoreFetchCollection<App>> | null>(null)
  const requestAll = ref(false)

  watchEffect(() => {
    if (role !== 'global' && requestAll.value) {
      lazyAll.value ??= firestoreFetchCollection<App>('apps')
    }
  })

  // 🔽 Flatten to avoid double `.value` at call sites
  const all = computed<App[] | null>(() => {
    const src = autoAll ?? lazyAll.value
    return src?.value ?? null
  })

  function fetchAll() {
    requestAll.value = true
    return all.value
  }

  // --- Subcollections
  const sub = useAppUsers()

  // --- Computed helpers
  const computedFlags = useAppComputed(app)

  // --- Services
  const ensure = computed(() => (app.value ? null : useAppEnsure()))
  const updates = computed(() => (app.value ? useAppUpdate(app.value) : null))

  return {
    app,
    collection: {
      all,       // Ref<App[] | null> (flattened)
      fetchAll,  // trigger for tenants
    },
    subcollections: { ...sub },
    computed: computedFlags,
    ensure,
    updates,
  }
}