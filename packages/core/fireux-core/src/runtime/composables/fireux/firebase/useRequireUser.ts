import type { User as FirebaseUser } from 'firebase/auth'
import { getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

/**
 * Waits for a signed-in Firebase user on the client.
 * Throws on SSR or if no user appears within `timeout` ms.
 */
export function useRequireUser(timeout = 5000): Promise<FirebaseUser> {
  if (!import.meta.client) {
    throw new Error('useRequireUser() must be called on the client.')
  }

  if (!getApps().length) {
    throw new Error(
      'Firebase must be initialized before calling useRequireUser().'
    )
  }

  const auth = getAuth()
  const existing = auth.currentUser
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      cleanup()
      reject(new Error('User not authenticated (timeout).'))
    }, timeout)

    const cleanup = () => {
      globalThis.clearTimeout(timer)
      unsubscribe?.()
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) return
        cleanup()
        resolve(user)
      },
      (err) => {
        cleanup()
        reject(err)
      }
    )
  })
}
