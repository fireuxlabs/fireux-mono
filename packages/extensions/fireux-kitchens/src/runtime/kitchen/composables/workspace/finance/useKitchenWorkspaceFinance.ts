import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { resolveReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { KitchenGrossSalesReport } from '../../../models/finance-report.model.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

export type KitchenFinanceRangeMode = 'today' | 'last-week' | 'custom'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceFinance() {
  const { currentUser } = useAuth()
  const fireux = useFireUXConfig()
  const session = useAppSession()
  const workspace = useKitchenWorkspace()
  const kitchenName = computed(() => {
    const kitchen = workspace.data.value as {
      display_name?: unknown
      presentation?: { display_name?: unknown }
      name?: unknown
    } | null
    return (
      text(
        kitchen?.presentation?.display_name ||
          kitchen?.display_name ||
          kitchen?.name
      ) || 'Selected Kitchen'
    )
  })

  const rangeMode = ref<KitchenFinanceRangeMode>('today')
  const customFrom = ref('')
  const customTo = ref('')
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
  const canLoad = computed(() =>
    Boolean(
      !validationError.value &&
        workspace.outcome.value === 'ready' &&
        workspace.data.value &&
        workspace.id.value &&
        currentUser.value &&
        !session.pending.value &&
        !session.error.value &&
        session.appUser.value
    )
  )

  function chooseRange(mode: KitchenFinanceRangeMode) {
    rangeMode.value = mode
    if (mode !== 'custom' || customFrom.value) return
    customTo.value = localIsoDate()
    customFrom.value = addIsoDays(customTo.value, -6)
  }

  // Each change invalidates the previous read, including a change away and back.
  const epoch = ref(0)
  const settledEpoch = ref(-1)
  let disposed = false
  watch(
    [
      () => currentUser.value?.uid || '',
      () => fireux.appId,
      () => JSON.stringify(session.appUser.value),
      session.pending,
      session.error,
      workspace.id,
      workspace.outcome,
      rangeMode,
      customFrom,
      customTo,
    ],
    () => {
      epoch.value += 1
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
    epoch.value += 1
  })

  const state = useLiveAsyncData<KitchenGrossSalesReport | null>(
    computed(
      () =>
        `kitchen-finance:${fireux.appId}:${currentUser.value?.uid || ''}:${workspace.id.value}:${rangeMode.value}:${customFrom.value}:${customTo.value}:${epoch.value}`
    ),
    async (liveFetch) => {
      const readEpoch = epoch.value
      const isCurrent = () => !disposed && readEpoch === epoch.value
      const user = currentUser.value
      const kitchenId = workspace.id.value
      const appId = fireux.appId
      if (!canLoad.value || !user || !kitchenId) return null
      const query =
        rangeMode.value === 'custom'
          ? {
              app_id: appId,
              kitchen_id: kitchenId,
              from_date: customFrom.value,
              to_date: customTo.value,
            }
          : { app_id: appId, kitchen_id: kitchenId, preset: rangeMode.value }
      try {
        const token = await user.getIdToken()
        if (!isCurrent() || !canLoad.value) return null
        const result = await liveFetch<KitchenGrossSalesReport>(
          '/api/workspace/kitchen/reports/gross-sales',
          { headers: { Authorization: `Bearer ${token}` }, query }
        )
        if (!isCurrent()) return null
        if (
          result.app_id !== appId ||
          result.kitchen_id !== kitchenId ||
          result.complete !== true
        )
          throw new Error('Sales report did not match the requested Kitchen.')
        settledEpoch.value = readEpoch
        return result
      } catch (error) {
        if (!isCurrent()) return null
        settledEpoch.value = readEpoch
        throw error
      }
    },
    { server: false }
  )
  const outcome = computed(() => {
    if (session.error.value || workspace.outcome.value === 'error')
      return 'error' as const
    if (session.pending.value || workspace.outcome.value === 'pending')
      return 'pending' as const
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (validationError.value) return 'error' as const
    if (!canLoad.value) return 'idle'
    if (settledEpoch.value !== epoch.value) return 'pending'
    return resolveReadOutcome({
      enabled: canLoad.value,
      pending: state.pending.value,
      failed: Boolean(state.error.value),
      present: Boolean(state.data.value?.sale_count),
    })
  })
  const report = computed(() =>
    ['ready', 'empty'].includes(outcome.value) ? state.data.value : null
  )
  const error = computed(
    () =>
      validationError.value ||
      (outcome.value === 'error'
        ? 'Sales could not be loaded. Try again when the connection is available.'
        : '')
  )
  const pending = computed(() => outcome.value === 'pending')

  return {
    rangeMode,
    customFrom,
    customTo,
    chooseRange,
    report,
    pending,
    outcome,
    error,
    kitchenName,
    canLoad,
    refresh: state.refresh,
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
