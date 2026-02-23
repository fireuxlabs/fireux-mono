import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { validateUserHandleForPublicRoute } from '../utils/identity/useUserHandleIdentity'

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

      const nextHandleRef = doc(db, 'handles', nextHandle)
      const nextHandleSnap = await transaction.get(nextHandleRef)

      if (nextHandleSnap.exists()) {
        const existingUid = String(nextHandleSnap.data()?.uid || '').trim()
        if (existingUid !== normalizedUid) {
          throw new Error('Handle already taken.')
        }
      }

      const previousHandleRef =
        currentHandle && currentHandle !== nextHandle
          ? doc(db, 'handles', currentHandle)
          : null
      const previousHandleSnap = previousHandleRef
        ? await transaction.get(previousHandleRef)
        : null

      const now = serverTimestamp()
      if (!nextHandleSnap.exists()) {
        transaction.set(nextHandleRef, {
          uid: normalizedUid,
          created_at: now,
          updated_at: now,
        })
      } else {
        transaction.update(nextHandleRef, {
          uid: normalizedUid,
          updated_at: now,
        })
      }

      transaction.update(userRef, {
        handle: nextHandle,
        handle_normalized: nextHandle,
        updated_at: now,
      })

      if (previousHandleRef && previousHandleSnap?.exists()) {
        const previousUid = String(previousHandleSnap.data()?.uid || '').trim()
        if (previousUid === normalizedUid) {
          transaction.delete(previousHandleRef)
        }
      }

      return { uid: normalizedUid, handle: nextHandle, changed: true }
    })

    return result
  }

  return { claimHandle }
}
