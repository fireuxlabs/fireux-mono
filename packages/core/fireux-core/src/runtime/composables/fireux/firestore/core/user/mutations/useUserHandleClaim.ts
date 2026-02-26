import {
  collection,
  doc,
  limit as fslimit,
  query as fsq,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { validateUserHandleForPublicRoute } from '../utils/identity/useUserHandleIdentity'
import { isVetoedHandle } from '../utils/identity/handleVeto'

type ClaimHandleResult = {
  uid: string
  handle: string
  changed: boolean
}

export function useUserHandleClaim() {
  const db = useFirestore()

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
      throw new Error('This handle is reserved.')
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

      const duplicateQuery = fsq(
        collection(db, 'users'),
        where('handle', '==', nextHandle),
        fslimit(2)
      )
      const duplicateSnap = (await (transaction as any).get(
        duplicateQuery as any
      )) as any
      const conflict = Array.isArray(duplicateSnap?.docs)
        ? duplicateSnap.docs.find(
            (row: any) => String(row?.id || '').trim() !== normalizedUid
          )
        : null
      if (conflict) {
        throw new Error('Handle already taken.')
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

    return result
  }

  return { claimHandle }
}
