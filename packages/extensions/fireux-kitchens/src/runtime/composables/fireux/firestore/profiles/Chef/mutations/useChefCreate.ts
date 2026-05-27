// Action: ENSURE · Phases: 1–4
// Sketch: Chef create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppChef, Chef } from '../../../../../../models/profiles/Chef/Chef.model'
import { chefConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Chef/config/chefConfig'

export const ChefCreatePlan = defineFireuxCreatePlan({
  family: 'with_ensure',
})

export function useChefCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { createUser } = useUserCreate()

  async function ensureChefProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await createUser()
    const { uid } = await requireUid()
    const { appId } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, chefConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
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
      } satisfies Omit<Chef, 'created' | 'updated' | 'id'>

      await setDocument<Chef>(chefConfig.collectionName, uid, payload as Chef, {
        creator: true,
      })
      createdCore = true
    }

    if (appId) {
      const appCollection = `apps/${appId}/${chefConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, chefConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AppChef, 'created' | 'updated' | 'id'>

        await setDocument<AppChef>(appCollection, uid, payload as AppChef, {
          app: true,
          creator: true,
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { createPlan: ChefCreatePlan, ensureChefProfile }
}
