// Action: ENSURE · Phases: 1–4
// Sketch: Chef create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'vuefire'
import type { ChefApp, ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'
import { chefConfig } from '../../../../../../models/profiles/Chef/Chef.model'

export function useChefCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()

  async function ensureChef(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, chefConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        id: uid,
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        bio_short: '',
        bio_long: '',
        specialties: [],
        locations: [],
        organization_name: '',
      } satisfies Omit<ChefCore, 'created_at' | 'updated_at' | 'creator_id'>

      await setDocument<ChefCore>(chefConfig.collectionName, uid, payload as ChefCore, {
        creator: 'require',
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${chefConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, chefConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {
          id: uid,
        } satisfies Omit<ChefApp, 'created_at' | 'updated_at' | 'creator_id'>

        await setDocument<ChefApp>(appCollection, uid, payload as ChefApp, {
          creator: 'require',
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureChef }
}
