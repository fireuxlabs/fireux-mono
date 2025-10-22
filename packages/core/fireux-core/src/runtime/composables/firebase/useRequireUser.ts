import { shallowRef, watch, type Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { User as FirebaseUser } from 'firebase/auth'

/**
 * Waits for a signed-in Firebase user on the client.
 * Throws on SSR or if no user appears within `timeout` ms.
 */
export function useRequireUser(timeout = 5000): Promise<FirebaseUser> {
  if (!import.meta.client) {
    throw new Error('useRequireUser() must be called on the client.')
  }

  const ref: Ref<FirebaseUser | null> =
    (useCurrentUser() as Ref<FirebaseUser | null>) ?? shallowRef(null)

  if (ref.value) return Promise.resolve(ref.value)

  return new Promise((resolve, reject) => {
    const start = performance.now()
    const stop = watch(
      ref,
      (val) => {
        if (val) {
          stop()
          resolve(val)
        } else if (performance.now() - start > timeout) {
          stop()
          reject(new Error('User not authenticated (timeout).'))
        }
      },
      { immediate: true }
    )
  })
}
