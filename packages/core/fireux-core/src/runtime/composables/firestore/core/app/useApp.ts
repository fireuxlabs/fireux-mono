import { ref, computed, type Ref } from 'vue'
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
  const appRef = computed<DocumentReference<App> | null>(() =>
    appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  )
  const { data: app } = useDocument<App>(appRef)

  // --- Global list (auto for global, lazy for tenants)
  type AppCollectionRef = Ref<App[] | undefined>

  const autoAll: AppCollectionRef | null =
    role === 'global' ? firestoreFetchCollection<App>('apps') : null

  const requestAll = ref(false)
  let tenantAll: AppCollectionRef | null = null

  const getCollectionRef = (): AppCollectionRef | null => {
    if (autoAll) return autoAll
    if (!requestAll.value) return null
    tenantAll ??= firestoreFetchCollection<App>('apps')
    return tenantAll
  }

  const all = computed<App[] | null>(() => {
    const source = getCollectionRef()
    return source?.value ?? null
  })

  const loadingAll = computed<boolean>(() => {
    const source = getCollectionRef()
    return source ? source.value === undefined : false
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
      all,
      loadingAll,
      fetchAll,
    },
    subcollections: { ...sub },
    computed: computedFlags,
    ensure,
    updates,
  }
}