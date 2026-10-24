import { ref, watch, type WatchSource } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/workspace/composables/useWorkspaceWriteGuard'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'

export function useKitchenIngredientSelection(
  ownerSources: WatchSource[] = []
) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  const config = useFireUXConfig()
  const route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const authoritySources = [
    workspace.id,
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
    () => route.fullPath,
  ]
  const captureIntent = useCommandScope([...authoritySources, ...ownerSources])
  const authorityEpoch = ref(0)
  watch(
    authoritySources,
    () => {
      authorityEpoch.value += 1
    },
    { flush: 'sync' }
  )
  async function command(
    action: 'create' | 'delete',
    kitchenId: string,
    ingredientId: string,
    options: { kitchenCollectionPath: string }
  ) {
    requireWritableData()
    const isCurrent = captureIntent()
    const kitchenCollectionPath = options.kitchenCollectionPath
    const uid = currentUser.value?.uid
    const allowed = () =>
      Boolean(
        isCurrent() &&
          uid &&
          !appPending.value &&
          !appError.value &&
          appOutcome.value === 'ready' &&
          currentUser.value?.uid === uid &&
          workspace.id.value === kitchenId &&
          access.ids.value.includes(kitchenId) &&
          kitchenCollectionPath === 'kitchens'
      )
    if (!allowed()) throw new Error('This Kitchen is read-only.')
    const token = await currentUser.value?.getIdToken()
    if (!token || !allowed())
      throw new Error('The account or Kitchen changed. Try again.')
    const result = await $fetch<{
      ok: true
      kitchenId: string
      ingredientId: string
    }>(`/api/workspace/kitchen/ingredients/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, ingredientId },
    })
    if (
      result?.ok !== true ||
      result.kitchenId !== kitchenId ||
      result.ingredientId !== ingredientId
    )
      throw new Error(
        'Ingredient selection response did not match the requested Kitchen and Ingredient.'
      )
    return ingredientId
  }
  return {
    captureIntent,
    authorityEpoch,
    selectIngredient: (
      kitchenId: string,
      ingredientId: string,
      options: { kitchenCollectionPath: string }
    ) => command('create', kitchenId, ingredientId, options),
    unselectIngredient: (
      kitchenId: string,
      ingredientId: string,
      options: { kitchenCollectionPath: string }
    ) => command('delete', kitchenId, ingredientId, options),
  }
}
