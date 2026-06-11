import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'

const normalize = (value: unknown) => String(value ?? '').trim()
const uniq = (values: unknown[]) =>
  Array.from(new Set(values.map(normalize).filter(Boolean)))

type KitchenConsoleScope = {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

/**
 * Kitchen console user relay.
 *
 * `myKitchens` is the user's personal Kitchen index.
 * `consoleKitchenIds` is the console list after crossing that index
 * against Kitchen operator/team authority.
 */
export function useKitchenUserComputed(scopes = computed<KitchenConsoleScope[]>(() => [])) {
  const user = useUser()
  const myKitchenIds = computed(() =>
    (user.coreUser.value?.myKitchens ?? [])
      .map(normalize)
      .filter(Boolean)
  )
  const userId = computed(() => normalize(user.coreUser.value?.id))
  const myKitchenIdSet = computed(() => new Set(myKitchenIds.value))
  const consoleKitchenIds = computed(() =>
    uniq(
      scopes.value
        .filter((scope) => {
          const id = normalize(scope.id)
          return (
            id &&
            myKitchenIdSet.value.has(id) &&
            targetHasOperator(scope, userId.value)
          )
        })
        .map((scope) => scope.id)
    )
  )
  const kitchenConsoleUser = computed(() => ({
    myKitchenCount: myKitchenIds.value.length,
    consoleKitchenIds: consoleKitchenIds.value,
    consoleKitchenCount: consoleKitchenIds.value.length,
  }))

  return {
    consoleKitchenIds,
    kitchenConsoleUser,
  }
}
