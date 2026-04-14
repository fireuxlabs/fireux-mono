import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

type SupplierCollectionDoc = Partial<Supplier> & { id?: string }

type UseSupplierCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'suppliers'

export function useSupplierCollection(options: UseSupplierCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const rootSource = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<SupplierCollectionDoc>(collectionPath)
  })

  const overlaySource = computed(() => {
    const resolvedAppId = String(appId || '').trim()
    if (!resolvedAppId) return null
    return firestoreFetchCollection<
      SupplierCollectionDoc & { team_ids?: string[]; admin_ids?: string[] }
    >(`apps/${resolvedAppId}/${DEFAULT_COLLECTION_PATH}`)
  })

  const suppliers = computed(() =>
    {
      const suppliersById = new Map<string, SupplierCollectionDoc>()
      for (const supplier of rootSource.value?.value ?? []) {
        const id = String(supplier?.id || '').trim()
        if (!id) continue
        suppliersById.set(id, {
          ...supplier,
          id,
        })
      }

      const currentUid = String(uid.value || '').trim()
      if (!currentUid) return []

      return (overlaySource.value?.value ?? [])
        .map((overlay) => {
          const id = String(overlay?.id || '').trim()
          const teamIds = Array.isArray((overlay as any)?.team_ids)
            ? (overlay as any).team_ids
            : Array.isArray((overlay as any)?.admin_ids)
              ? (overlay as any).admin_ids
              : []

          return {
            id,
            teamIds: teamIds
              .map((value: unknown) => String(value || '').trim())
              .filter(Boolean),
            overlay,
          }
        })
        .filter((entry) => Boolean(entry.id) && entry.teamIds.includes(currentUid))
        .map((entry) => ({
          ...(suppliersById.get(entry.id) ?? {}),
          ...(entry.overlay ?? {}),
          id: entry.id,
        }))
        .filter((supplier) => Boolean(supplier.id))
    }
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(
    () => rootSource.value?.value === undefined || overlaySource.value?.value === undefined
  )

  return {
    suppliers,
    count,
    pending,
  }
}
