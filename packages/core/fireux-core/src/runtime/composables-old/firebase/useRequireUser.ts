import { shallowRef, watch, type Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { User as FirebaseUser } from 'firebase/auth'

/**
 * Resolves with the current Firebase user once available.
 * Throws if used during SSR or when no user materialises within the timeout.
 */
export function useRequireUser(timeout = 5000): Promise<FirebaseUser> {
  if (!import.meta.client) {
    throw new Error('useRequireUser() must be called on the client.')
  }

  const ref: Ref<FirebaseUser | null> =
    (useCurrentUser() as Ref<FirebaseUser | null>) ?? shallowRef(null)

  if (ref.value) {
    return Promise.resolve(ref.value)
  }

  return new Promise((resolve, reject) => {
    const start = performance.now()
    const stop = watch(
      ref,
      (value) => {
        if (value) {
          stop()
          resolve(value)
        } else if (performance.now() - start > timeout) {
          stop()
          reject(new Error('User not authenticated (timeout).'))
        }
      },
      { immediate: true }
    )
  })
}
