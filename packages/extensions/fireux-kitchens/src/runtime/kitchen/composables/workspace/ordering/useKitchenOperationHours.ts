import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'

export function useKitchenOperationHours() {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const access = useKitchenAccess()
  const captureIntent = useCommandScope([() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => JSON.stringify(access.ids.value), () => access.outcome.value])
  async function updateHours(
    kitchenId: string,
    hours: WeekdayTimeWindowsConfig | null
  ) {
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    const body = { kitchenId, hours: JSON.parse(JSON.stringify(hours)) }
    const user = await useRequireUser()
    if (!isCurrent() || user.uid !== uid) throw new Error('The account or Kitchen changed. Reopen serving hours.')
    const token = await user.getIdToken()
    if (!isCurrent() || !['ready', 'empty'].includes(access.outcome.value) || !access.ids.value.includes(kitchenId)) throw new Error('Current Kitchen association is required.')
    const result = await $fetch<{ ok: true; kitchenId: string }>(
      '/api/workspace/kitchen/ordering/hours',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      }
    )
    if (result.ok !== true || result.kitchenId !== kitchenId)
      throw new Error('Kitchen hours update response was invalid.')
  }
  return { updateHours, captureIntent }
}
