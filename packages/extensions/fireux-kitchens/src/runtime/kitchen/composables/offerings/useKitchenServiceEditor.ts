import { computed, inject, provide, reactive, type InjectionKey } from 'vue'
import { useKitchenServicesContext } from './useKitchenServicesContext'
import { useServiceSetup } from './useServiceSetup'
import {
  kitchenOfferingOptions,
  offeringsForOption,
  type KitchenOfferingOption,
} from '../../utils/offering-options'
import type { KitchenOffering } from '../../models/offering.model'
import { serviceMenuReadiness } from '../../utils/service-menus'

function createKitchenServiceEditor(
  option: KitchenOfferingOption,
  offering: () => KitchenOffering | undefined
) {
  const workspace = useKitchenServicesContext()
  const { source, retained } = workspace
  const services = computed(() => {
    const record = offering()
    return record
      ? kitchenOfferingOptions.filter(
          (option) => offeringsForOption([record], option).length
        )
      : []
  })
  const props = reactive({
    option,
    get kitchenId() {
      return source.kitchenId.value
    },
    get offering() {
      return offering()
    },
    get sharedSetup() {
      return services.value.length > 1
    },
    get timezone() {
      return retained.value?.timezone || ''
    },
    get disabled() {
      return !source.canWrite.value
    },
    save: source.configure,
    updateInteraction: source.updateInteraction,
    captureIntent: source.captureIntent,
  })
  const editor = reactive(useServiceSetup(props))
  const menus = computed(() => retained.value?.menus || [])
  const readiness = computed(() =>
    serviceMenuReadiness(editor.menuIds, menus.value)
  )
  return {
    option,
    workspace,
    services,
    editor,
    menus,
    readiness,
    disabled: computed(() => props.disabled || editor.busy),
    kitchenHours: computed(() => retained.value?.kitchenHours),
  }
}
const key: InjectionKey<ReturnType<typeof createKitchenServiceEditor>> = Symbol(
  'KitchenServiceEditor'
)
export function provideKitchenServiceEditor(
  option: KitchenOfferingOption,
  offering: () => KitchenOffering | undefined
) {
  const context = createKitchenServiceEditor(option, offering)
  provide(key, context)
  return context
}
export function useKitchenServiceEditor() {
  const context = inject(key)
  if (!context)
    throw new Error('Service controls require their editor provider.')
  return context
}
