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
        chef_headline: '',
        chef_bio: '',
        chef_image: '',
        chef_signature_dishes: [] as string[],
        chef_organization_name: '',
        title: '',
        subtitle: '',
        tagline: '',
        tags: [] as string[],
        summary: '',
        bio_long: '',
        specialties: [] as string[],
        locations: [] as string[],
        organization_name: '',
        kitchen_ids: [] as string[],
      } satisfies Omit<ChefCore, 'created' | 'updated' | 'id'>

      await setDocument<ChefCore>(chefConfig.collectionName, uid, payload as ChefCore, {
        creator: true,
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${chefConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, chefConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<ChefApp, 'created' | 'updated' | 'id'>

        await setDocument<ChefApp>(appCollection, uid, payload as ChefApp, {
          creator: true,
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureChef }
}
