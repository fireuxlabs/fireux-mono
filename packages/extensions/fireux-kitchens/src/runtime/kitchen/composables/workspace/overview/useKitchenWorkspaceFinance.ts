import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { KitchenGrossSalesReport } from '../../../models/finance-report.model.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

export type KitchenFinanceRangeMode = 'today' | 'last-week' | 'custom'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceFinance() {
  const { currentUser } = useAuth()
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const kitchenName = computed(() => {
    const kitchen = workspace.data.value as {
      display_name?: unknown
      identity?: { display_name?: unknown }
      name?: unknown
    } | null
    return text(
      kitchen?.identity?.display_name || kitchen?.display_name || kitchen?.name
    ) || 'Selected Kitchen'
  })

  const rangeMode = ref<KitchenFinanceRangeMode>('today')
  const customFrom = ref('')
  const customTo = ref('')
  const report = ref<KitchenGrossSalesReport | null>(null)
  const pending = ref(false)
  const requestError = ref('')
  const validationError = computed(() => {
    if (rangeMode.value !== 'custom') return ''
    if (!customFrom.value || !customTo.value) return 'Choose both dates.'
    if (customFrom.value > customTo.value) {
      return 'The end date must be on or after the start date.'
    }
    return differenceInDays(customFrom.value, customTo.value) + 1 > 93
      ? 'Choose a range of 93 days or fewer.'
      : ''
  })
  const error = computed(() => validationError.value || requestError.value)
  const canLoad = computed(() => Boolean(
    !validationError.value && workspace.id.value && currentUser.value
  ))
  let requestSequence = 0

  function chooseRange(mode: KitchenFinanceRangeMode) {
    rangeMode.value = mode
    if (mode !== 'custom' || customFrom.value) return
    customTo.value = localIsoDate()
    customFrom.value = addIsoDays(customTo.value, -6)
  }

  async function load() {
    const sequence = ++requestSequence
    report.value = null
    requestError.value = ''
    if (!canLoad.value) return

    const user = currentUser.value
    const kitchenId = workspace.id.value
    if (!user || !kitchenId) return

    pending.value = true
    try {
      const token = await user.getIdToken()
      const query = rangeMode.value === 'custom'
        ? {
            app_id: fireux.appId,
            kitchen_id: kitchenId,
            from_date: customFrom.value,
            to_date: customTo.value,
          }
        : {
            app_id: fireux.appId,
            kitchen_id: kitchenId,
            preset: rangeMode.value,
          }
      const next = await $fetch<KitchenGrossSalesReport>(
        '/api/workspace/kitchen/reports/gross-sales',
        { headers: { Authorization: `Bearer ${token}` }, query }
      )
      if (sequence === requestSequence) report.value = next
    } catch (caught) {
      if (sequence === requestSequence) requestError.value = reportErrorMessage(caught)
    } finally {
      if (sequence === requestSequence) pending.value = false
    }
  }

  watch(
    [currentUser, workspace.id, rangeMode, customFrom, customTo],
    () => void load(),
    { immediate: true }
  )
  onBeforeUnmount(() => { requestSequence += 1 })

  return {
    rangeMode,
    customFrom,
    customTo,
    chooseRange,
    report,
    pending,
    error,
    kitchenName,
    canLoad,
    refresh: load,
  }
}

function localIsoDate() {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function addIsoDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function differenceInDays(from: string, to: string) {
  const start = new Date(`${from}T00:00:00.000Z`).getTime()
  const end = new Date(`${to}T00:00:00.000Z`).getTime()
  return Math.floor((end - start) / 86_400_000)
}

function reportErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const value = error as { data?: { statusMessage?: unknown }; message?: unknown }
    return text(value.data?.statusMessage || value.message) || 'Could not load the report.'
  }
  return 'Could not load the report.'
}
