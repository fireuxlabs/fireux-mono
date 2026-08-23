import { onMounted, ref, watchEffect, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { rememberAnonymousAccountUpgrade } from 'fireux-core/runtime/composables/fireux/firebase/anonymous-account-upgrade'
import { useKitchenAnonymousAdoption } from './useKitchenAnonymousAdoption'

export function useKitchenWorkspaceIndexEntry(
  selectedKitchenId: Ref<string>,
  enabled: boolean,
  refresh?: () => Promise<void>
) {
  const { currentUser, hasIdentity } = useAuth()
  const clientReady = ref(!enabled)

  if (enabled) {
    const { adopt } = useKitchenAnonymousAdoption()

    watchEffect(() => {
      const user = currentUser.value
      const kitchenId = selectedKitchenId.value
      if (!user?.isAnonymous || !kitchenId) return

      void rememberAnonymousAccountUpgrade(user, {
        family: 'kitchen',
        targetId: kitchenId,
      })
    })

    onMounted(async () => {
      const adopted = await adopt()
      if (adopted) await refresh?.()
      clientReady.value = true
    })
  }

  return { clientReady, hasIdentity }
}
