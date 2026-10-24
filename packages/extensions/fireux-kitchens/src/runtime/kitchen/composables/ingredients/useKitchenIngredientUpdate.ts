import { ref, watch, type WatchSource } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAccess } from '../useKitchenAccess'

export function useKitchenIngredientUpdate(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const access = useKitchenAccess()
  const config = useFireUXConfig()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const authoritySources = [
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
  ]
  const captureIntent = useCommandScope([...authoritySources, ...ownerSources])
  const captureCommand = useCommandScope(authoritySources)
  const authorityEpoch = ref(0)
  watch(
    [...authoritySources, ...ownerSources],
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
    const isCurrent = captureCommand()
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
