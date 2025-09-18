// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'
import type {
  ProfileUpdate,
  ProfileBase as CoreProfileBase,
} from 'fireux-core/runtime/models/profiles/profile.model'
import type { ChefCoreProfile as Chef } from '../../../../models/profiles/Chef.model'

// Fields we never allow to be updated here
const IMMUTABLE_KEYS = new Set(['id', 'created_at'])

export function useChefUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  // Generic, safe field updater
  type UpdatableChef = Chef &
    Pick<CoreProfileBase, 'avatar' | 'id' | 'created_at' | 'updated_at'>
  const updateFields = async (patch: ProfileUpdate<UpdatableChef>) => {
    const user = await waitForCurrentUser()
    if (!user?.uid) throw new Error('User not authenticated')

    // Strip undefined/null and immutable keys
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(patch ?? {})) {
      if (v === undefined || v === null) continue
      if (IMMUTABLE_KEYS.has(k)) continue
      payload[k] = v
    }
    // Always bump updated_at on server
    payload.updated_at = serverTimestamp()

    const ref = doc(db, 'chefs', user.uid)
    await updateDoc(ref, payload)
  }

  // Convenience wrappers (keep types narrow where useful)
  const updateSingle = (field: keyof Chef, value: string | number | boolean) =>
    updateFields({ [field]: value } as ProfileUpdate<UpdatableChef>)

  const updateArray = <K extends keyof Chef>(field: K, value: Chef[K]) =>
    updateFields({ [field]: value } as ProfileUpdate<UpdatableChef>)

  return {
    // Basic profile updates (aligned to slim model)
    updateChefName: (v: string) => updateSingle('name', v),
    updateTitle: (v: string) => updateSingle('title', v),
    updateBioShort: (v: string) => updateSingle('bioShort', v),
    updateBioLong: (v: string) => updateSingle('bioLong', v),

    // Arrays
    updateSpecialties: (v: string[]) => updateArray('specialties', v),
    // Removed legacy/non-model fields (years_experience, available_for_hire, etc.)
    // Re-introduce via extension types and proper mappers if needed in the future.

    // Escape hatch for batching arbitrary changes (already safe)
    updateFields,
  }
}
