// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfileEnsure.ts
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { ProfileConfig, ProfileBase } from './useProfile'
import { useUser } from '../user/useUser.ts'

/**
 * Ensure profile documents exist (core + optional app overlay).
 * - Creates only if missing; never overwrites.
 */
export function useProfileEnsure(_profile: unknown, config: ProfileConfig) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const { user } = useUser()

  const ensure = async (profile: Record<string, unknown> = {}) => {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id

    const base: ProfileBase = {
      id: uid,
      display_name: user.value.core?.display_name || uid,
      avatar: user.value.core?.avatar || '',
    }

    let createdCore = false
    let createdApp = false

    // Core (global) doc
    {
      const coreRef = doc(db, config.collectionName, uid)
      const snap = await getDoc(coreRef)
      if (!snap.exists()) {
        await setDoc(coreRef, { ...base, ...profile }, { merge: false })
        createdCore = true
      }
    }

    // App (tenant overlay)
    if (isTenant && appId) {
      const appRef = doc(db, `apps/${appId}/${config.collectionName}`, uid)
      const snap = await getDoc(appRef)
      if (!snap.exists()) {
        await setDoc(appRef, { ...base, ...profile }, { merge: false })
        createdApp = true
      }
    }

    return { createdCore, createdApp } as const
  }

  return { ensure }
}
