import { getAuth, type User } from 'firebase/auth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useCurrentUser } from '../../../composables/fireux/firestore/vuefire'
import { getCurrentScope, type Ref } from 'vue'
import {
  captureCommandScope,
  useCommandScope,
} from '../../../composables/fireux/commands/useCommandScope'
import { requireUid } from '../../../composables/fireux/firestore/utils/useEnsureCommon'
import { provisionUserIdentity } from './provision-user'
import { userDisplayNameSeed } from '../../utils/display-name-seed'

/** Provision canonical User identity. */
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
  async function createUser(
    intendedUser?: User,
    isOwnerCurrent: () => boolean = () => true
  ): Promise<void> {
    const scope = captureLifecycle
      ? { isCurrent: captureLifecycle(), stop() {} }
      : captureCommandScope(sources)
    const isCurrent = () => scope.isCurrent() && isOwnerCurrent()
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
    } finally {
      scope.stop()
    }
  }

  return { bootstrapUser: createUser }
}
