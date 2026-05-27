// Action: ENSURE · Phases: 1–4
// Sketch: Professional create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppProfessional, Professional } from '../../../../../../models/profiles/Professional/Professional.model'
import { professionalConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/config/professionalConfig'

export const ProfessionalCreatePlan = defineFireuxCreatePlan({
  family: 'with_ensure',
})

export function useProfessionalCreate() {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const appDb = useFirestore()
  const identityDb = useFirestore(identityDatabaseId)
  const appCreate = useFirestoreCreate()
  const identityCreate = useFirestoreCreate({ databaseId: identityDatabaseId })
  const identityUpdate = useFirestoreUpdate({ databaseId: identityDatabaseId })
  const { createUser } = useUserCreate()

  async function ensureProfessionalProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await createUser()
    const { uid } = await requireUid()
    const { appId } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(identityDb, professionalConfig.collectionName, uid)
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

      await identityCreate.setDocument<Professional>(
        professionalConfig.collectionName,
        uid,
        payload as unknown as Professional,
        { creator: true }
      )
      createdCore = true
    }

    if (appId) {
      const appCollection = `apps/${appId}/${professionalConfig.collectionName}`
      const appRef = doc(appDb, 'apps', appId, professionalConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AppProfessional, 'created' | 'updated' | 'id'>

        await appCreate.setDocument<AppProfessional>(
          appCollection,
          uid,
          payload as unknown as AppProfessional,
          {
            app: true,
            creator: true,
          }
        )
        createdApp = true
      }
    }

    if (professionalConfig.id) {
      try {
        await identityUpdate.updateDocument('users', uid, {
          profiles: arrayUnion(professionalConfig.id) as unknown as string[],
        })
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useProfessionalCreate] failed to tag user profile', {
            uid,
            profileId: professionalConfig.id,
            error,
          })
        }
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { createPlan: ProfessionalCreatePlan, ensureProfessionalProfile }
}
