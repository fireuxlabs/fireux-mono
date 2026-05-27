import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import {
  AppSupplierStorage,
  SupplierStorage,
} from '../../../../../models/supplier/Supplier.model'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useSupplierDelete() {
  const { deleteDocument } = useFirestoreDelete()
  const { appId } = useFireUXConfig()
  const hasAppScope = Boolean(appId)

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('Not authenticated')
    return u.uid
  }

  const deleteSupplier = async (options?: {
    scope?: DeleteScope
    id?: string
  }) => {
    const scope = options?.scope ?? 'auto'
    const id = await resolveUid(options?.id)

    const shouldDeleteCore =
      scope === 'core' || scope === 'both' || (!hasAppScope && scope === 'auto')
    if (shouldDeleteCore) {
      await deleteDocument(SupplierStorage.rootCollection, id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (hasAppScope && scope === 'auto')
    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for app-scoped delete')
      await deleteDocument(`apps/${appId}/${AppSupplierStorage.collection}`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = hasAppScope ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteSupplier }
}
