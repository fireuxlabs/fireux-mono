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
        id: uid,
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        bio_short: '',
        contact_email: '',
        contact_phone: '',
        website_url: '',
      } satisfies Omit<AgentCore, 'created_at' | 'updated_at' | 'creator_id'>

      await setDocument<AgentCore>(agentConfig.collectionName, uid, payload as AgentCore, {
        creator: 'require',
      })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${agentConfig.collectionName}`
      const appRef = doc(db, 'apps', appId, agentConfig.collectionName, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        const payload = {
          id: uid,
        } satisfies Omit<AgentApp, 'created_at' | 'updated_at' | 'creator_id'>

        await setDocument<AgentApp>(appCollection, uid, payload as AgentApp, {
          creator: 'require',
        })
        createdApp = true
      }
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureAgent }
}
