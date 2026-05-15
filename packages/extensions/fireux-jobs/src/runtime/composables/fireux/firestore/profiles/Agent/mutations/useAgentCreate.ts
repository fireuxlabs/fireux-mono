// Action: ENSURE · Phases: 1–4
// Sketch: Agent create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { AppAgent, Agent } from '../../../../../../models/profiles/Agent/Agent.model'
import { agentConfig } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Agent/config/agentConfig'

export function useAgentCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { ensureUser } = useUserEnsure()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

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

    const coreRef = doc(db, agentConfig.collectionName, uid)
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

      await setDocument<Agent>(agentConfig.collectionName, uid, payload as Agent, {
        creator: true,
      })
      createdCore = true
    }

    if (appId) {
      const appCollection = `apps/${appId}/${agentConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, agentConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AppAgent, 'created' | 'updated' | 'id'>

        await setDocument<AppAgent>(appCollection, uid, payload as AppAgent, {
          app: true,
          creator: true,
        })
        createdApp = true
      }
    }

    await upsertSeoIndexDoc('seo_index_agents', uid, {
      path: `/agents/${uid}`,
      isPublic: true,
    })

    if (agentConfig.id) {
      try {
        await updateDocument('users', uid, {
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

  return { ensureAgentProfile }
}
