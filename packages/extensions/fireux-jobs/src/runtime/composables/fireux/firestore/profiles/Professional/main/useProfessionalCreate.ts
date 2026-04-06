// Action: ENSURE · Phases: 1–4
// Sketch: Professional create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppProfessional, Professional } from '../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'

export function useProfessionalCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function ensureProfessionalProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, professionalConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        title: '',
        subtitle: '',
        tagline: '',
        summary: '',
        bio: '',
        image: '',
        positions: [],
        tags: [],
        relevant_experience: [],
        other_experience: [],
        languages: [],
        certifications: [],
        education: [],
        volunteering: [],
        projects: [],
      } satisfies Omit<Professional, 'created' | 'updated' | 'id'>

      await setDocument<Professional>(professionalConfig.collectionName, uid, payload as unknown as Professional, {
        creator: true,
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${professionalConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, professionalConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AppProfessional, 'created' | 'updated' | 'id'>

        await setDocument<AppProfessional>(appCollection, uid, payload as unknown as AppProfessional, {
          creator: true,
        })
        createdApp = true
      }
    }

    await upsertSeoIndexDoc('seo_index_professionals', uid, {
      path: `/professionals/${uid}`,
      isPublic: true,
    })

    return { createdCore, createdApp, id: uid }
  }

  return { ensureProfessionalProfile }
}
