// Action: ENSURE · Phases: 1–4
// Sketch: Agent create (core + app, conditional)
// One doc, one action, one name. No wiring yet.

import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUserEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon'
import { useFirestore } from 'vuefire'
import type { AgentApp, AgentCore } from '../../../../../../models/profiles/Agent/Agent.model'
import { agentConfig } from '../../../../../../models/profiles/Agent/Agent.model'

export function useAgentCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureUser } = useUserEnsure()

  async function ensureAgent(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    await ensureUser()
    const { uid } = await requireUid()
    const { appId, isTenant } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, agentConfig.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        agent_headline: '',
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
      } satisfies Omit<AgentCore, 'created' | 'updated' | 'id'>

      await setDocument<AgentCore>(agentConfig.collectionName, uid, payload as AgentCore, {
        creator: true,
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${agentConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, agentConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {} satisfies Omit<AgentApp, 'created' | 'updated' | 'id'>

        await setDocument<AgentApp>(appCollection, uid, payload as AgentApp, {
          creator: true,
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureAgent }
}
