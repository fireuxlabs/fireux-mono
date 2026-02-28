import {
  collection,
  doc,
  getDocs,
  limit as fslimit,
  query as fsq,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useSeoIndexWrite } from '../../../../seo/useSeoIndexWrite'
import { validateUserHandleForPublicRoute } from '../utils/identity/useUserHandleIdentity'
import { isVetoedHandle } from '../utils/identity/handleVeto'

type ClaimHandleResult = {
  uid: string
  handle: string
  changed: boolean
}

export function useUserHandleClaim() {
  const db = useFirestore()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  const claimHandle = async (
    uid: string,
    desiredHandle: string
  ): Promise<ClaimHandleResult> => {
    const normalizedUid = String(uid || '').trim()
    if (!normalizedUid) throw new Error('Missing uid')

    const validation = validateUserHandleForPublicRoute(desiredHandle)
    if (!validation.isValid) throw new Error(validation.message || 'Invalid handle')
    const nextHandle = validation.handle
    if (isVetoedHandle(nextHandle)) {
      throw new Error('This handle is already in use.')
    }

    const duplicateQuery = fsq(
      collection(db, 'users'),
      where('handle', '==', nextHandle),
      fslimit(2)
    )
    const duplicateSnap = await getDocs(duplicateQuery)
    const conflict = duplicateSnap.docs.find(
      (row) => String(row.id || '').trim() !== normalizedUid
    )
    if (conflict) {
      throw new Error('This handle is already in use.')
    }

    const result = await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', normalizedUid)
      const userSnap = await transaction.get(userRef)

      if (!userSnap.exists()) {
        throw new Error(`User not found for uid: ${normalizedUid}`)
      }

      const userData = (userSnap.data() || {}) as Record<string, unknown>
      const currentHandle = String(userData.handle || '').trim().toLowerCase()
      if (currentHandle === nextHandle) {
        return { uid: normalizedUid, handle: nextHandle, changed: false }
      }

      const now = serverTimestamp()
      transaction.update(userRef, {
        handle: nextHandle,
        updated: {
          at: now,
          by: normalizedUid,
        },
      })

      return { uid: normalizedUid, handle: nextHandle, changed: true }
    })

    await upsertSeoIndexDoc('seo_index_users', result.uid, {
      path: `/users/${result.handle}`,
      isPublic: true,
    })

    return result
  }

  return { claimHandle }
}
