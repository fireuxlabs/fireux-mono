import {
  computed,
  inject,
  provide,
  shallowRef,
  watch,
  watchEffect,
  onScopeDispose,
  type InjectionKey,
} from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useKitchenOfferings } from './useKitchenOfferings'
import { kitchenOfferingOptions } from '../../utils/offering-options'
import { serviceOverviewSnapshot } from '../../utils/service-overview'

function createKitchenServicesContext() {
  const source = useKitchenOfferings()
  // Retained values are presentation only. Commands always use source authority.
  const retained = shallowRef<{
    kitchen: NonNullable<typeof source.selectedKitchen.value>
    offerings: typeof source.offerings.value
    menus: typeof source.menus.value
    timezone: string
    kitchenHours: typeof source.kitchenHours.value
  } | null>(null)
  watch(
    source.editorOwnerKey,
    () => {
      retained.value = null
    },
    { flush: 'sync' }
  )
  watch(
    source.editorAccessDenied,
    (denied) => {
      if (denied) retained.value = null
    },
    { flush: 'sync' }
  )
  watchEffect(() => {
    if (
      source.editorAccessDenied.value ||
      !['ready', 'empty'].includes(source.outcome.value) ||
      !source.selectedKitchen.value
    )
      return
    retained.value = {
      kitchen: source.selectedKitchen.value,
      offerings: source.offerings.value,
      menus: ['ready', 'empty'].includes(source.menusOutcome.value)
        ? source.menus.value
        : retained.value?.menus || [],
      timezone: source.timezone.value,
      kitchenHours: source.kitchenHours.value,
    }
  })
  const snapshot = computed(() =>
    serviceOverviewSnapshot({
      kitchenId: source.kitchenId.value,
      outcome: source.outcome.value,
      menusOutcome: source.menusOutcome.value,
      canWrite: source.canWrite.value,
      offerings: source.offerings.value,
      menus: source.menus.value,
    })
  )
  const page = useWorkspacePageState('kitchen')
  watchEffect(() => page.publish(snapshot.value))
  onScopeDispose(() =>
    page.publish({ derived: { outcome: 'idle' }, services: [] })
  )
  return { source, retained, snapshot, options: kitchenOfferingOptions }
}
const key: InjectionKey<ReturnType<typeof createKitchenServicesContext>> =
  Symbol('KitchenServices')
export function provideKitchenServicesContext() {
  const context = createKitchenServicesContext()
  provide(key, context)
  return context
}
export function useKitchenServicesContext() {
  const context = inject(key)
  if (!context) throw new Error('Services requires its workspace provider.')
  return context
}
