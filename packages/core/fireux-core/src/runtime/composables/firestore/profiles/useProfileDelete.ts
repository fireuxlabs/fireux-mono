// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileDelete.ts
import { ref, type Ref } from 'vue'
import {
  doc,
  deleteDoc,
  getDocs,
  collectionGroup,
  query,
  where,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

export type DeleteScope = 'core' | 'app' | 'both' | 'auto'

export interface DeleteOptions {
  /** Override target user id; defaults to current profile.id (flattened) */
  id?: string
  /** 'core' | 'app' | 'both' | 'auto' (default: 'auto') */
  scope?: DeleteScope
  /** Delete overlays in ALL apps (collectionGroup search) */
  allApps?: boolean
  /** Force a specific appId (when scope includes 'app' and not allApps) */
  appId?: string
}

/**
 * Delete profile docs:
 * - scope: 'core' | 'app' | 'both' | 'auto'
 * - allApps: delete ALL app overlays via collectionGroup
 */
export function useProfileDelete(
  _profile: Ref<any>, // not used now, kept for future hook symmetry
  config: ProfileConfig
) {
  const db = useFirestore()
  const { role, appId: envAppId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteCore(id: string) {
    await deleteDoc(doc(db, config.collectionName, id))
  }

  async function deleteApp(id: string, targetAppId?: string) {
    const appPath = `apps/${targetAppId}/${config.collectionName}`
    await deleteDoc(doc(db, appPath, id))
  }

  async function deleteAllAppOverlays(id: string) {
    // relies on required ProfileBase.id stored in each doc
    const cg = collectionGroup(db, config.collectionName)
    const q = query(cg, where('id', '==', id))
    const snap = await getDocs(q)
    const ops: Promise<void>[] = []
    snap.forEach((d) => ops.push(deleteDoc(d.ref)))
    await Promise.all(ops)
  }

  async function deleteProfile(opts: DeleteOptions = {}) {
    const { id, scope = 'auto', allApps = false, appId: explicitAppId } = opts

    if (!id) throw new Error('Profile id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // Decide scope
      const doCore =
        scope === 'core' || scope === 'both' || (scope === 'auto' && !isTenant)
      const doApp =
        scope === 'app' || scope === 'both' || (scope === 'auto' && isTenant)

      // Core
      if (doCore) await deleteCore(id)

      // App overlays (single or all)
      if (doApp) {
        if (allApps) {
          await deleteAllAppOverlays(id)
        } else {
          const targetAppId = explicitAppId ?? envAppId
          if (!targetAppId) {
            // No appId present → nothing to delete (or throw to hard-fail)
            // throw new Error('appId required to delete app overlay')
            return 'success' as const
          }
          await deleteApp(id, targetAppId)
        }
      }

      return 'success' as const
    } catch (e: any) {
      deleteError.value =
        e instanceof Error
          ? e
          : new Error(`Failed to delete ${config.profileType} profile`)
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
