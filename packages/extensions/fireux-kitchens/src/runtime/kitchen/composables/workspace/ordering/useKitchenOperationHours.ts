import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'

export function useKitchenOperationHours() {
  async function updateHours(
    kitchenId: string,
    hours: WeekdayTimeWindowsConfig | null
  ) {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: true; kitchenId: string }>(
      '/api/workspace/kitchen/ordering/hours',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, hours },
      }
    )
    if (result.ok !== true || result.kitchenId !== kitchenId)
      throw new Error('Kitchen hours update response was invalid.')
  }
  return { updateHours }
}
