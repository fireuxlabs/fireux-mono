import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'

export function useKitchenIngredientSelection() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([workspace.id, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => JSON.stringify(access.ids.value), () => access.outcome.value])
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
        isCurrent() && uid &&
          currentUser.value?.uid === uid &&
          workspace.id.value === kitchenId &&
          access.ids.value.includes(kitchenId) &&
          kitchenCollectionPath === 'kitchens'
      )
    if (!allowed()) throw new Error('This Kitchen is read-only.')
    const token = await currentUser.value?.getIdToken()
    if (!token || !allowed())
      throw new Error('The account or Kitchen changed. Try again.')
    const result = await $fetch<{ ok: true; kitchenId: string; ingredientId: string }>(`/api/workspace/kitchen/ingredients/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, ingredientId },
    })
    if (result?.ok !== true || result.kitchenId !== kitchenId || result.ingredientId !== ingredientId) throw new Error('Ingredient selection response did not match the requested Kitchen and Ingredient.')
    return ingredientId
  }
  return {
    captureIntent,
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
