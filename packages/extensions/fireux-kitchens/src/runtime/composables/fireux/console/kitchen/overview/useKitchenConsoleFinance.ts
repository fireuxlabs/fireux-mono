// Concurrent edit — 2026-07-21 17:05 CEST — Kitchen Finance surface: load the bounded live gross-sales projection.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  KitchenFinanceReportPeriodDays,
  type KitchenFinanceReportPeriod,
  type KitchenGrossSalesReport,
} from '../../../../../models/kitchen/finance-report.model'
import { useKitchenConsole } from '../core/useKitchenConsole'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleFinance() {
  const { currentUser } = useAuth()
  const { selection, runtime } = useKitchenConsole()
  const selectedPeriod = ref<KitchenFinanceReportPeriod>('30d')
  const report = ref<KitchenGrossSalesReport | null>(null)
  const pending = ref(false)
  const error = ref('')
  let requestSequence = 0

  const periodOptions = [
    { value: '7d' as const, label: '7 days' },
    { value: '30d' as const, label: '30 days' },
    { value: '90d' as const, label: '90 days' },
  ]
  const isLive = computed(() => selection.kitchenSource.value === 'live')
  const canLoad = computed(() => Boolean(
    isLive.value &&
    text(runtime.appId.value) &&
    text(selection.kitchenId.value) &&
    currentUser.value
  ))

  async function load() {
    const sequence = ++requestSequence
    report.value = null
    error.value = ''
    pending.value = false
    if (!canLoad.value) return

    const user = currentUser.value
    const appId = text(runtime.appId.value)
    const kitchenId = text(selection.kitchenId.value)
    if (!user || !appId || !kitchenId) return

    pending.value = true
    const to = new Date()
    const periodDays = KitchenFinanceReportPeriodDays[
      selectedPeriod.value as KitchenFinanceReportPeriod
    ]
    const from = new Date(
      to.getTime() - periodDays * 86_400_000
    )

    try {
      const token = await user.getIdToken()
      if (sequence !== requestSequence) return
      const response = await $fetch<KitchenGrossSalesReport>(
        '/api/console/kitchen/reports/gross-sales',
        {
          headers: { Authorization: `Bearer ${token}` },
          query: {
            app_id: appId,
            kitchen_id: kitchenId,
            from: from.toISOString(),
            to: to.toISOString(),
          },
        }
      )
      if (sequence !== requestSequence) return
      report.value = response
    } catch (caught) {
      if (sequence !== requestSequence) return
      error.value = reportErrorMessage(caught)
    } finally {
      if (sequence === requestSequence) pending.value = false
    }
  }

  watch(
    [
      currentUser,
      runtime.appId,
      selection.kitchenId,
      selection.kitchenSource,
      selectedPeriod,
    ],
    () => void load(),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestSequence += 1
  })

  return {
    selectedPeriod,
    periodOptions,
    report,
    pending,
    error,
    isLive,
    canLoad,
    refresh: load,
  }
}

function reportErrorMessage(error: unknown) {
  const source = error && typeof error === 'object'
    ? error as {
        data?: { statusMessage?: unknown }
        message?: unknown
        statusMessage?: unknown
      }
    : {}

  return text(
    source.data?.statusMessage || source.statusMessage || source.message
  ) || 'The finance report could not be loaded.'
}
