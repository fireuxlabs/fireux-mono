import { useNuxtApp } from '#imports'
import { collection } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useCollection, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAppUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useAppUserCollection'
import { computed } from 'vue'
import { watchEffect } from 'vue'
import type { SupplierCore } from '../../models/supplier/Supplier.model'
import type { CoreUser } from 'fireux-core/runtime/models/core/user.model'
import type { Ref } from 'vue'
import { SUPPLIER_COLLECTION } from './constants'

// Hydrated supplier records for UI use.
export function useSupplierFetch() {
  const db = useFirestore()
  const nuxtApp = useNuxtApp()
  const { firestoreFetchDoc } = useFirestoreRead()
  const { users } = useAppUserCollection()

  const coreSuppliersRef = useCollection<SupplierCore>(
    collection(db, SUPPLIER_COLLECTION) as any,
    { idField: 'id' } as any
  )

  const coreUserRefs = new Map<string, Ref<CoreUser | undefined>>()

  const ensureCoreUserRef = (id?: string | null) => {
    if (!id) return undefined
    if (!coreUserRefs.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<CoreUser>('users', id)
      ) as Ref<CoreUser | undefined>
      coreUserRefs.set(id, ref)
    }
    return coreUserRefs.get(id)
  }

  watchEffect(() => {
    for (const supplier of coreSuppliersRef.value ?? []) {
      const id = supplier?.id?.trim()
      if (id) ensureCoreUserRef(id)
    }
  })

  const userMap = computed(() => {
    const map = new Map<string, CoreUser>()
    for (const entry of users.value ?? []) {
      if (!entry?.id) continue
      map.set(entry.id, entry as CoreUser)
    }
    return map
  })

  const coreSuppliersHydrated = computed(() =>
    (coreSuppliersRef.value ?? []).map((supplier) => {
      const id = supplier?.id?.trim()
      if (!id) return supplier

      const user = userMap.value.get(id) ?? coreUserRefs.get(id)?.value
      if (!user) return supplier

      return {
        ...supplier,
        user,
      }
    })
  )

  const coreSuppliers = computed(() => coreSuppliersHydrated.value ?? [])
  const { byId: supplier } = useCollectionById(coreSuppliers)

  const pending = computed(() => coreSuppliersHydrated.value === undefined)

  return {
    coreSuppliers,
    supplier,
    pending,
  }
}
