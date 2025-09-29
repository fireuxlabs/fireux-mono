import { ref, type Ref } from 'vue'
import {
  doc,
  deleteDoc,
  collectionGroup,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'
import type { DeleteOptions, DeleteScope } from '../delete.types'

/**
 * Delete user docs (core/app) with flexible scope.
 * - If id isn't provided, we try userRef.value?.id
 * - scope 'auto': core in global env, app in tenant env
 * - allApps=true removes overlays across all apps (collection group)
 */
export function useUserDelete(userRef?: Ref<User | null | undefined>) {
  const db = useFirestore()
  const { role, appId: envAppId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteCore(id: string) {
    await deleteDoc(doc(db, 'core-users', id))
  }

  async function deleteApp(id: string, targetAppId: string) {
    await deleteDoc(doc(db, `apps/${targetAppId}/users`, id))
  }

  async function deleteAllAppOverlays(id: string) {
    // Find all app overlays where field 'id' === user id
    const cg = collectionGroup(db, 'users')
    const q = query(cg, where('id', '==', id))
    const snap = await getDocs(q)
    const ops: Promise<void>[] = []
    snap.forEach((d) => ops.push(deleteDoc(d.ref)))
    await Promise.all(ops)
  }

  async function deleteUser(opts: DeleteOptions = {}) {
    const resolvedId = opts.id ?? userRef?.value?.id
    if (!resolvedId) throw new Error('User id is required')

    const scope: DeleteScope = opts.scope ?? 'auto'
    const allApps = opts.allApps ?? false
    const explicitAppId = opts.appId

    deleting.value = true
    deleteError.value = null

    try {
      const doCore =
        scope === 'core' || scope === 'both' || (scope === 'auto' && !isTenant)

      const doApp =
        scope === 'app' || scope === 'both' || (scope === 'auto' && isTenant)

      if (doCore) await deleteCore(resolvedId)

      if (doApp) {
        if (allApps) {
          await deleteAllAppOverlays(resolvedId)
        } else {
          const targetAppId = explicitAppId ?? envAppId
          if (targetAppId) {
            await deleteApp(resolvedId, targetAppId)
          }
          // if no appId resolved, silently succeed (nothing to delete)
        }
      }

      return 'success' as const
    } catch (e: any) {
      deleteError.value = e instanceof Error ? e : new Error('Delete failed')
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return { deleteUser, deleting, deleteError }
}
