import { onScopeDispose, ref, watch, type Ref } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { KitchenDeliveryZone } from '../../../models/fulfilment.model'
import {
  normalizedZone,
  type EditableZone,
} from '../../../utils/delivery-zones'

/** Save only deliberate, complete area edits; mounting and hydration never write. */
export function useDeliveryZoneAutosave(options: {
  zones: Ref<EditableZone[]>
  syncing: Ref<boolean>
  kitchenId: () => string
  canWrite: () => boolean
  captureIntent: () => () => boolean
  update: (zones: KitchenDeliveryZone[]) => Promise<unknown>
}) {
  const saving = ref(false),
    error = ref(''),
    status = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  const capture = useCommandScope([options.kitchenId, options.canWrite])
  const cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }
  onScopeDispose(cancel)
  watch([options.kitchenId, options.canWrite], cancel, { flush: 'sync' })
  watch(
    options.zones,
    () => {
      if (options.syncing.value || !options.canWrite()) return
      cancel()
      const local = capture(),
        owner = options.captureIntent()
      const rows = options.zones.value.map(normalizedZone)
      const complete = rows.every(
        (zone) =>
          zone &&
          (zone.min_order_chf ?? 0) >= 0 &&
          (zone.fee_chf ?? 0) >= 0 &&
          ((zone.radius_m ?? 0) > 0 ||
            Boolean(zone.postal_codes?.length) ||
            (zone.polygon?.length ?? 0) >= 3)
      )
      if (!complete) {
        status.value = 'Complete each delivery area to update it.'
        return
      }
      timer = setTimeout(async () => {
        timer = undefined
        if (!local() || !owner() || !options.canWrite()) return
        saving.value = true
        error.value = ''
        status.value = 'Updating…'
        try {
          await options.update(rows as KitchenDeliveryZone[])
          if (local() && owner()) status.value = 'Updated'
        } catch (cause) {
          if (local() && owner()) {
            error.value =
              cause instanceof Error ? cause.message : 'Please try again.'
            status.value = ''
          }
        } finally {
          if (local()) saving.value = false
        }
      }, 600)
    },
    { deep: true, flush: 'sync' }
  )
  return { saving, error, status }
}
