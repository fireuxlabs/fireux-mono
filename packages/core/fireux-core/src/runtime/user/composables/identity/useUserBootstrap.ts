// Concurrent edit — 2026-11-03 — User setup ensures basic App membership.

import { getAuth, type User } from 'firebase/auth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useCurrentUser } from '../../../composables/fireux/firestore/vuefire'
import { getCurrentScope, type Ref } from 'vue'
import {
  captureCommandScope,
  useCommandScope,
} from '../../../composables/fireux/commands/useCommandScope'
import { requireUid } from '../../../composables/fireux/firestore/utils/useEnsureCommon'
import { runAppUserCommand } from '../../../app/utils/runAppUserCommand'
import { provisionUserIdentity } from '../../utils/provision-user'
import { userDisplayNameSeed } from '../../utils/display-name-seed'

/** Provision canonical User identity and its default AppUser membership. */
export function useUserBootstrap(
  currentUser: Ref<User | null | undefined> = useCurrentUser()
) {
  const fireux = useFireUXConfig()
  const sources = [() => currentUser.value?.uid, () => fireux.appId]
  const captureLifecycle = getCurrentScope() ? useCommandScope(sources) : null
  const requireCurrentUser = (auth: User, isCurrent: () => boolean) => {
    if (
      !isCurrent() ||
      getAuth().currentUser?.uid !== auth.uid ||
      currentUser.value?.uid !== auth.uid
    )
      throw new Error('The signed-in account changed. Please try again.')
  }
  async function ensureAppUserJoinedEvent(
    auth: User,
    isCurrent: () => boolean
  ): Promise<{ created: boolean; ready: boolean }> {
    const token = await auth.getIdToken()
    let lastError: unknown = null

    for (let attempt = 0; attempt < 2; attempt += 1) {
      requireCurrentUser(auth, isCurrent)
      try {
        const response = await fetch('/api/internal/events/user-joined', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Event endpoint returned ${response.status}`)
        }

        const payload = (await response.json()) as {
          event?: { created?: boolean }
        }
        return {
          created: payload.event?.created === true,
          ready: true,
        }
      } catch (error) {
        lastError = error
      }
    }

    console.warn('[useUserBootstrap] app user event is not ready', {
      error: lastError,
    })
    return { created: false, ready: false }
  }

  async function createUser(intendedUser?: User): Promise<void> {
    const scope = captureLifecycle
      ? { isCurrent: captureLifecycle(), stop() {} }
      : captureCommandScope(sources)
    const isCurrent = scope.isCurrent
    try {
      const auth = intendedUser ?? (await requireUid()).auth
      const uid = auth.uid
      requireCurrentUser(auth, isCurrent)
      await provisionUserIdentity(
        uid,
        {
          displayName: userDisplayNameSeed({
            displayName: auth.displayName,
            email: auth.email,
            uid,
            isAnonymous: auth.isAnonymous,
          }),
        },
        isCurrent
      )
      requireCurrentUser(auth, isCurrent)
      await runAppUserCommand({ action: 'ensure-self' }, auth)
      requireCurrentUser(auth, isCurrent)

      try {
        await ensureAppUserJoinedEvent(auth, isCurrent)
        requireCurrentUser(auth, isCurrent)
      } catch (error) {
        requireCurrentUser(auth, isCurrent)
        console.warn('[useUserBootstrap] App membership event was skipped', {
          error,
        })
      }
    } finally {
      scope.stop()
    }
  }

  return { bootstrapUser: createUser }
}
