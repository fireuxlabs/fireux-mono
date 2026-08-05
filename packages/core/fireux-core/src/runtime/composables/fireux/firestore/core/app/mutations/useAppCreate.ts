import { doc, getDoc } from 'firebase/firestore'
import {
  AppStorage,
  type AppCreateInput,
} from '../../../../../../models/core/app.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { normalizeString } from '../../../../../../utils/string'
import { useFirestore } from '../../../vuefire'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useEcosystemCreate } from '../../ecosystem/mutations/useEcosystemCreate'
import {
  buildAppEnsureCreateInput,
  buildAppEnsureRepairPatch,
} from '../utils/appEnsurePayload'
import { syncAppMediaToStorage } from '../utils/appMediaSync'

// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: defer App write clients until the explicit create action.

export type AppCreateOptions = {
  collectionPath?: string
}

export type AppCreateResult = {
  created: boolean
  id: string
}

export function useAppCreate(options: AppCreateOptions = {}) {
  const collectionPath =
    normalizeString(options.collectionPath || AppStorage.collection) ||
    AppStorage.collection

  async function createApp(input?: AppCreateInput): Promise<AppCreateResult> {
    const db = useFirestore()
    const { setDocument } = useFirestoreCreate()
    const { updateDocument } = useFirestoreUpdate()
    const { createEcosystem } = useEcosystemCreate()
    const fireux = useFireUXConfig()
    const payload = input ?? buildAppEnsureCreateInput(fireux)
    const resolvedId = normalizeString(payload?.id)

    if (!resolvedId) {
      throw new Error('App id is required')
    }

    if (!input) {
      await createEcosystem()
    }

    const ref = doc(db, collectionPath, resolvedId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      if (!input) {
        const repairPatch = buildAppEnsureRepairPatch(
          (snap.data() as Record<string, unknown>) ?? {},
          fireux
        )

        if (Object.keys(repairPatch).length) {
          await updateDocument(collectionPath, resolvedId, repairPatch)
        }
      }

      return { created: false, id: resolvedId }
    }

    await setDocument(collectionPath, resolvedId, payload, {
      creator: true,
    })

    return { created: true, id: resolvedId }
  }

  return { createApp, syncAppMedia: syncAppMediaToStorage }
}
