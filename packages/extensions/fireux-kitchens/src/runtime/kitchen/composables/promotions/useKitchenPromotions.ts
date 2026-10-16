import { computed } from 'vue'
import { useKitchenWorkspaceIdentity } from '../workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenChildCollection } from '../useKitchenChildCollection'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type {
  KitchenPromotion,
  KitchenPromotionInput,
} from '../../models/promotion.model'

export function useKitchenPromotions() {
  const identity = useKitchenWorkspaceIdentity()
  const session = useAppSession()
  const config = useFireUXConfig()
  const kitchenId = computed(() =>
    identity.outcome.value === 'ready' ? identity.kitchenId.value : ''
  )
  const canWrite = computed(
    () =>
      identity.canWrite.value &&
      ['user', 'admin', 'dev'].includes(String(session.appUser.value?.role))
  )
  const collection = useKitchenChildCollection<KitchenPromotion>(
    'promotions',
    kitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  const dishes = useKitchenChildCollection<{ id: string; name: string }>(
    'dishes',
    kitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  const currency = computed(() =>
    readPlaceCurrencyCode(identity.selectedKitchen.value)
  )
  const scopeKey = computed(
    () =>
      `${kitchenId.value}:${session.uid.value}:${config.appId}:${JSON.stringify(session.appUser.value)}:${canWrite.value}`
  )
  const captureIntent = useCommandScope([scopeKey])
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  async function command(body: Record<string, unknown>) {
    requireWritableData()
    if (!canWrite.value || !kitchenId.value)
      throw new Error('Choose a Kitchen you can manage.')
    const input = JSON.parse(
      JSON.stringify({ ...body, kitchenId: kitchenId.value })
    )
    const uid = session.uid.value
    const current = captureIntent()
    const assertCurrent = () => {
      if (!current() || session.uid.value !== uid)
        throw new Error('The account or Kitchen changed. Try again.')
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Try again.')
    const token = await user.getIdToken()
    assertCurrent()
    requireWritableData()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/promotions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: input,
      }
    )
    if (!result?.id)
      throw new Error('The response did not identify the promotion.')
    return result
  }
  return {
    kitchenId,
    canWrite,
    currency,
    scopeKey,
    captureIntent,
    collection,
    dishes,
    identity,
    save: (promotion: KitchenPromotionInput, promotionId?: string) =>
      command({ promotion, ...(promotionId ? { promotionId } : {}) }),
  }
}
export type KitchenPromotionsState = ReturnType<typeof useKitchenPromotions>
