import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useFirestoreEcosystemEnsure } from '../../../system/ecosystem/mutations/useFirestoreEcosystemEnsure'
import { useProjectEnsure } from '../../project/mutations/useProjectEnsure'
import {
  buildAppEnsureCreateInput,
  buildAppEnsureRepairPatch,
} from '../utils/appEnsurePayload'
import { syncAppMediaToStorage } from '../utils/appMediaSync'
import { useAppCreate } from './useAppCreate'

type EnsureAppResult = {
  created: boolean
  id: string
}

export function useAppEnsure() {
  const db = useFirestore()
  const { createApp } = useAppCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { ensureProjectDoc } = useProjectEnsure()
  const { ensureFirestoreEcosystemDoc } = useFirestoreEcosystemEnsure()

  async function ensureApp(): Promise<EnsureAppResult> {
    const fireux = useFireUXConfig()
    await ensureProjectDoc()
    await ensureFirestoreEcosystemDoc()

    const createPayload = buildAppEnsureCreateInput(fireux)

    const ref = doc(db, 'apps', fireux.appId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const repairPatch = buildAppEnsureRepairPatch(
        (snap.data() as Record<string, unknown>) ?? {},
        fireux
      )

      if (Object.keys(repairPatch).length) {
        await updateDocument('apps', fireux.appId, repairPatch)
      }
      return { created: false, id: fireux.appId }
    }

    // NOTE: App creation does NOT imply user membership.
    // User ↔ App binding is handled explicitly elsewhere.

    await createApp(createPayload)

    return { created: true, id: fireux.appId }
  }

  return { ensureApp, syncAppMedia: syncAppMediaToStorage }
}
