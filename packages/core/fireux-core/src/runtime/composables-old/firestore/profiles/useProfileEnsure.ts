// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileEnsure.ts
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useUser } from '../user/useUser'

/**
 * Create the profile if it doesn't exist (core + optional app).
 * - No overwrite. If doc exists, it is left as-is.
 * - Returns flags so UI can react.
 */
export function useProfileEnsure(_profile: any, config: ProfileConfig) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const { user } = useUser()

  async function ensure(profile: Record<string, any> = {}) {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id

    const base = {
      id: uid,
      // privacy-safe; never derive from email
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
    if (isTenant) {
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
