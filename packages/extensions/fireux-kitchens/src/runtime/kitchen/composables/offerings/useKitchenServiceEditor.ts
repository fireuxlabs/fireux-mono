import { computed, inject, provide, reactive, type InjectionKey } from 'vue'
import { useKitchenServicesContext } from './useKitchenServicesContext'
import { useServiceSetup } from './useServiceSetup'
import {
  offeringsForOption,
  type KitchenOfferingOption,
} from '../../utils/offering-options'
import { serviceMenuReadiness } from '../../utils/service-menus'

function createKitchenServiceEditor(option: KitchenOfferingOption) {
  const workspace = useKitchenServicesContext()
  const { source, retained } = workspace
  const props = reactive({
    option,
    get kitchenId() {
      return source.kitchenId.value
    },
    get offering() {
      return offeringsForOption(retained.value?.offerings || [], option)[0]
    },
    get timezone() {
      return retained.value?.timezone || ''
    },
    get disabled() {
      return !source.canWrite.value
    },
    save: source.configure,
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
export function provideKitchenServiceEditor(option: KitchenOfferingOption) {
  const context = createKitchenServiceEditor(option)
  provide(key, context)
  return context
}
export function useKitchenServiceEditor() {
  const context = inject(key)
  if (!context)
    throw new Error('Service controls require their editor provider.')
  return context
}
