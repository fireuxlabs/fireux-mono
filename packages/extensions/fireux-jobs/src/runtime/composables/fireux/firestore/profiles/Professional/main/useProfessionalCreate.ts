// Action: ENSURE · Phases: 1–4
// Sketch: Professional create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'vuefire'
import type { ProfessionalApp, ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from '../../../../../../models/profiles/Professional/Professional.model'

export function useProfessionalCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()

  async function ensureProfessional(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, professionalConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        id: uid,
        title: '',
        health_certifications: [],
        bio_short: '',
        bio_long: '',
        specialties: [],
        locations: [],
        relevant_experience: [],
        other_experience: [],
        languages: [],
        certifications: [],
        education: [],
        volunteering: [],
        projects: [],
      } satisfies Omit<ProfessionalCore, 'created_at' | 'updated_at' | 'creator_id'>

      await setDocument<ProfessionalCore>(professionalConfig.collectionName, uid, payload as ProfessionalCore, {
        creator: 'require',
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${professionalConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, professionalConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {
          id: uid,
        } satisfies Omit<ProfessionalApp, 'created_at' | 'updated_at' | 'creator_id'>

        await setDocument<ProfessionalApp>(appCollection, uid, payload as ProfessionalApp, {
          creator: 'require',
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureProfessional }
}
