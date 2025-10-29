import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig.ts'
import type { ProfileConfig } from '../../../models/profiles/profile.model.ts'
import { useUser } from '../core/user/_useUser.ts'

type ProfileEnsureResult = {
  createdCore: boolean
  createdApp: boolean
}

/**
 * Ensures that a profile document exists for the active user in core/app scopes.
 */
export function useProfileEnsure(_profile: unknown, config: ProfileConfig) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const { user } = useUser()

  const ensure = async (
    profile: Record<string, unknown> = {}
  ): Promise<ProfileEnsureResult> => {
    if (!user.value?.id) throw new Error('User not loaded')
    const uid = user.value.id

    const base = {
      id: uid,
      display_name: user.value.core?.display_name || uid,
      avatar: user.value.core?.avatar || '',
    }

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, config.collectionName, uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      await setDoc(coreRef, { ...base, ...profile }, { merge: false })
      createdCore = true
    }

    if (isTenant) {
      const appRef = doc(db, `apps/${appId}/${config.collectionName}`, uid)
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        await setDoc(appRef, { ...base, ...profile }, { merge: false })
        createdApp = true
      }
    }

    return { createdCore, createdApp }
  }

  return { ensure }
}
