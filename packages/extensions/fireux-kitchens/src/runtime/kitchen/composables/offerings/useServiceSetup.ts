import { computed, onScopeDispose, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type {
  KitchenOffering,
  KitchenOfferingInteractionChanges,
} from '../../models/offering.model'
import type { KitchenOfferingOption } from '../../utils/offering-options'
import { offeringOptionEnabled } from '../../utils/offering-options'
import { newKitchenOfferingInteraction } from '../../utils/offering-interaction'
import type { KitchenOrderType } from '../../models/offering-interaction-types.model'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model'
import { requireOperatingHours } from '../../utils/operating-hours'

type ServiceSetup = {
  option: KitchenOfferingOption
  kitchenId: string
  offering?: KitchenOffering
  timezone: string
  disabled?: boolean
  sharedSetup?: boolean
  captureIntent?: () => () => boolean
  save: (
    input: Record<string, unknown>,
    current?: () => boolean
  ) => Promise<unknown>
  updateInteraction?: (
    id: string,
    type: KitchenOrderType,
    changes: KitchenOfferingInteractionChanges,
    current: () => boolean
  ) => Promise<unknown>
}

/** One inline service editor; domain commands retain persistence and authority. */
export function useServiceSetup(props: ServiceSetup) {
  const record = ref(props.offering)
  const enabled = ref(false)
  const menuIds = ref<string[]>([])
  const sameAsKitchen = ref(true)
  const hours = ref<WeekdayTimeWindowsConfig | null>(null)
  const hoursDirty = ref(false)
  let commitRevision = 0
  const busy = ref(false)
  const error = ref('')
  const timezone = computed(
    () => record.value?.hours?.timezone || props.timezone
  )
  let timer: ReturnType<typeof setTimeout> | undefined
  const capture = useCommandScope([
    () => props.kitchenId,
    () => props.option.key,
    () => props.disabled,
    () => props.offering?.id,
  ])
  function hydrate(offering = record.value) {
    enabled.value = Boolean(
      offering &&
        (props.sharedSetup || props.option.key === 'counter'
          ? offering.enabled
          : offeringOptionEnabled(offering, props.option))
    )
    menuIds.value = [...(offering?.menu_ids || [])]
    sameAsKitchen.value = offering?.hours_source !== 'custom'
    if (!hoursDirty.value) hours.value = offering?.hours || null
  }
  hydrate()
  watch(
    () => props.offering,
    (offering) => {
      if (busy.value || timer) return
      record.value = offering
      hydrate()
    }
  )
  onScopeDispose(() => clearTimeout(timer))

  async function commit(
    changes: Record<string, unknown>,
    available?: boolean,
    patches: Partial<
      Record<KitchenOrderType, KitchenOfferingInteractionChanges>
    > = {},
    intentCurrent: () => boolean = () => true,
    write?: (current: () => boolean) => Promise<unknown>
  ) {
    if (busy.value || props.disabled) return false
    const local = capture()
    const owner = props.captureIntent?.() || (() => true)
    const current = () => local() && owner() && intentCurrent()
    const revision = ++commitRevision
    busy.value = true
    error.value = ''
    try {
      const result = (await (write
        ? write(current)
        : props.save(
            {
              ...(record.value ? { offeringId: record.value.id } : {}),
              option: props.option.key,
              ...(available !== undefined || !record.value || !props.sharedSetup
                ? { enabled: available ?? enabled.value }
                : {}),
              interactions: props.option.types.map((type) => ({
                type,
                changes: patches[type] || {},
              })),
              ...changes,
            },
            current
          ))) as { offering: KitchenOffering }
      if (!current()) return false
      record.value = result.offering
      menuIds.value = [...result.offering.menu_ids]
      return true
    } catch (cause) {
      if (current())
        error.value =
          cause instanceof Error ? cause.message : 'Please try again.'
      return false
    } finally {
      if (revision === commitRevision) {
        busy.value = false
        if (!current() && props.offering) {
          record.value = props.offering
          hydrate()
        }
      }
    }
  }
  async function setEnabled(value: boolean) {
    const changes: Record<string, unknown> = {}
    if (timer) {
      clearTimeout(timer)
      timer = undefined
      try {
        changes.hours = readHours(hours.value)
        changes.hours_source = 'custom'
      } catch {
        /* Turning off must still work while hours are invalid. */
      }
    }
    const previous = enabled.value
    enabled.value = value
    if (!(await commit(changes, value))) enabled.value = previous
  }
  async function setMenus(input: unknown[]) {
    const value = input.filter((id): id is string => typeof id === 'string')
    const previous = menuIds.value
    menuIds.value = [...value]
    if (!(await commit({ menu_ids: [...value] }))) menuIds.value = previous
  }
  function readHours(value: WeekdayTimeWindowsConfig | null) {
    return value === null ? null : requireOperatingHours(value)
  }
  function setHours(value: WeekdayTimeWindowsConfig | null) {
    hoursDirty.value = true
    hours.value = value
    clearTimeout(timer)
    const local = capture()
    const owner = props.captureIntent?.() || (() => true)
    timer = setTimeout(async () => {
      timer = undefined
      if (props.disabled || !local() || !owner()) return
      if (busy.value) {
        setHours(value)
        return
      }
      try {
        if (await commit({ hours: readHours(value), hours_source: 'custom' })) {
          hoursDirty.value = false
          hours.value = record.value?.hours || null
        }
      } catch (cause) {
        error.value =
          cause instanceof Error ? cause.message : 'Enter valid serving hours.'
      }
    }, 500)
  }
  async function setSameAsKitchen(value: boolean) {
    clearTimeout(timer)
    timer = undefined
    const previous = sameAsKitchen.value
    sameAsKitchen.value = value
    if (
      !(await commit({
        hours_source: value ? 'kitchen' : 'custom',
        hours: null,
      }))
    )
      sameAsKitchen.value = previous
    else {
      hoursDirty.value = false
      hours.value = null
    }
  }
  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) {
        clearTimeout(timer)
        timer = undefined
        commitRevision++
        busy.value = false
      } else if (hoursDirty.value) {
        setHours(hours.value)
      }
    },
    { flush: 'sync' }
  )
  const interactions = computed(() => {
    const types: readonly KitchenOrderType[] = props.option.types
    return types
      .filter(
        (type) =>
          !props.sharedSetup ||
          record.value?.interactions.some((row) => row.type === type)
      )
      .map((type) => {
        const saved = record.value?.interactions.find(
          (row) => row.type === type
        )
        return saved && saved.type !== 'browse'
          ? saved
          : { ...newKitchenOfferingInteraction(type), enabled: true }
      })
  })
  async function updateInteraction(
    type: KitchenOrderType,
    changes: KitchenOfferingInteractionChanges,
    current?: () => boolean
  ) {
    if (!(await commit({}, undefined, { [type]: changes }, current)))
      throw new Error(error.value || 'The service changed. Please try again.')
  }
  async function setInteractionEnabled(type: KitchenOrderType, value: boolean) {
    const id = record.value?.id
    const update = props.updateInteraction
    if (!id || !update || !props.sharedSetup) return
    await commit({}, enabled.value, {}, undefined, (current) =>
      update(id, type, { enabled: value }, current)
    )
  }
  return {
    record,
    interactions,
    updateInteraction,
    setInteractionEnabled,
    enabled,
    menuIds,
    hours,
    sameAsKitchen,
    setSameAsKitchen,
    timezone,
    busy,
    error,
    setEnabled,
    setMenus,
    setHours,
  }
}
