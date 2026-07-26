// Concurrent edit — 2026-07-21 17:05 CEST — Kitchen Finance surface: load the bounded live gross-sales projection.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  KitchenFinanceReportPeriodDays,
  type KitchenFinanceReportPeriod,
  type KitchenGrossSalesReport,
} from '../../../../../models/kitchen/finance-report.model'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../core/useKitchenConsoleDemoData'
import { useKitchenConsole } from '../core/useKitchenConsole'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleFinance() {
  const { currentUser } = useAuth()
  const { selection, runtime } = useKitchenConsole()
  const isDemo = computed(() => selection.kitchenSource.value === 'demo')
  const isLive = computed(() => selection.kitchenSource.value === 'live')
  const isTest = computed(() => selection.kitchenSource.value === 'test')
  const demoData = useKitchenConsoleDemoData(isDemo)
  const demoScenario = computed(() =>
    findKitchenConsoleDemoScenario(
      demoData.data.value,
      selection.kitchenId.value
    )
  )
  const selectedPeriod = ref<KitchenFinanceReportPeriod>('30d')
  const report = ref<KitchenGrossSalesReport | null>(null)
  const requestPending = ref(false)
  const pending = computed(() =>
    isDemo.value ? demoData.pending.value : requestPending.value
  )
  const error = ref('')
  let requestSequence = 0

  const periodOptions = [
    { value: '7d' as const, label: '7 days' },
    { value: '30d' as const, label: '30 days' },
    { value: '90d' as const, label: '90 days' },
  ]
  const canLoad = computed(() => Boolean(
    isDemo.value
      ? demoScenario.value?.finance
      : isLive.value &&
        text(runtime.appId.value) &&
        text(selection.kitchenId.value) &&
        currentUser.value
  ))

  async function load() {
    const sequence = ++requestSequence
    report.value = null
    error.value = ''
    requestPending.value = false
    if (!canLoad.value) return

    const to = new Date()
    const periodDays = KitchenFinanceReportPeriodDays[
      selectedPeriod.value as KitchenFinanceReportPeriod
    ]
    const from = new Date(
      to.getTime() - periodDays * 86_400_000
    )
    if (isDemo.value) {
      const scenario = demoScenario.value
      const summary = scenario?.finance?.grossSales[selectedPeriod.value]
      if (!scenario || !summary) return
      const averageAmountMinor = Math.round(
        summary.grossSalesMinor / summary.saleCount
      )

      report.value = {
        app_id: scenario.appId,
        kitchen_id: text(scenario.kitchen.id),
        period: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        generated_at: to.toISOString(),
        sale_count: summary.saleCount,
        currencies: [
          {
            currency_code: summary.currencyCode,
            sale_count: summary.saleCount,
            gross_sales: {
              amount_minor: summary.grossSalesMinor,
              currency_code: summary.currencyCode,
            },
            average_sale: {
              amount_minor: averageAmountMinor,
              currency_code: summary.currencyCode,
            },
          },
        ],
        complete: true,
      }
      return
    }

    const user = currentUser.value
    const appId = text(runtime.appId.value)
    const kitchenId = text(selection.kitchenId.value)
    if (!user || !appId || !kitchenId) return

    requestPending.value = true
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
      if (sequence === requestSequence) requestPending.value = false
    }
  }

  watch(
    [
      currentUser,
      runtime.appId,
      selection.kitchenId,
      selection.kitchenSource,
      selectedPeriod,
      demoData.data,
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
    isDemo,
    isTest,
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
