// Action: ENSURE · Phases: 1–4
// Sketch: Agent create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppAgent, Agent } from '../../../../../../models/profiles/Agent/Agent.model'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'

export const AgentCreatePlan = defineFireuxCreatePlan({
  family: 'with_ensure',
})

export function useAgentCreate() {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const appDb = useFirestore()
  const identityDb = useFirestore(identityDatabaseId)
  const appCreate = useFirestoreCreate()
  const identityCreate = useFirestoreCreate({ databaseId: identityDatabaseId })
  const identityUpdate = useFirestoreUpdate({ databaseId: identityDatabaseId })
  const { ensureUser } = useUserEnsure()

  async function ensureAgentProfile(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(identityDb, agentConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        title: '',
        subtitle: '',
        tagline: '',
        tags: [] as string[],
        agent_bio: '',
        summary: '',
        agent_image: '',
        agent_placement_types: [] as string[],
        agent_coverage_areas: [] as string[],
        agent_contact_email: '',
        agent_contact_phone: '',
        agent_website_url: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
      } satisfies Omit<Agent, 'created' | 'updated' | 'id'>

      await identityCreate.setDocument<Agent>(
        agentConfig.collectionName,
        uid,
        payload as Agent,
        { creator: true }
      )
      createdCore = true
    }

    if (appId) {
      const appCollection = `apps/${appId}/${agentConfig.collectionName}`
      const appRef = doc(appDb, 'apps', appId, agentConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AppAgent, 'created' | 'updated' | 'id'>

        await appCreate.setDocument<AppAgent>(
          appCollection,
          uid,
          payload as AppAgent,
          {
            app: true,
            creator: true,
          }
        )
        createdApp = true
      }
    }

    if (agentConfig.id) {
      try {
        await identityUpdate.updateDocument('users', uid, {
          profiles: arrayUnion(agentConfig.id) as unknown as string[],
        })
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useAgentCreate] failed to tag user profile', {
            uid,
            profileId: agentConfig.id,
            error,
          })
        }
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { createPlan: AgentCreatePlan, ensureAgentProfile }
}
