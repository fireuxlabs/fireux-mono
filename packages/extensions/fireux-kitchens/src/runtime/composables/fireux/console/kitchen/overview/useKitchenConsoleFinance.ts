// Concurrent edit — 2026-07-21 17:05 CEST — Kitchen Finance surface: load the bounded live gross-sales projection.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  type KitchenFinanceItemSummary,
  type KitchenFinanceReportPeriod,
  type KitchenGrossSalesReport,
} from '../../../../../models/kitchen/finance-report.model'
import {
  projectKitchenDemoFinanceReport,
  type KitchenDemoFinanceReport,
} from '../../../../../utils/kitchen/demo-finance'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../core/useKitchenConsoleDemoData'
import { useKitchenConsole } from '../core/useKitchenConsole'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleFinance() {
  const { currentUser } = useAuth()
  const { selection, runtime } = useKitchenConsole()
  const isDemo = runtime.isDemo
  const isLive = computed(() => runtime.dataType.value === 'live')
  const kitchenName = computed(() => {
    const kitchen = selection.kitchen.value as {
      display_name?: unknown
      identity?: { display_name?: unknown }
      name?: unknown
    } | null
    return text(
      kitchen?.identity?.display_name
      || kitchen?.display_name
      || kitchen?.name
    ) || 'Selected Kitchen'
  })
  const demoData = useKitchenConsoleDemoData(isDemo)
  const demoScenario = computed(() =>
    findKitchenConsoleDemoScenario(
      demoData.data.value,
      selection.kitchenId.value
    )
  )
  const selectedPeriod = ref<KitchenFinanceReportPeriod>('30d')
  const report = ref<KitchenGrossSalesReport | null>(null)
  const demoFinanceReport = ref<KitchenDemoFinanceReport | null>(null)
  const requestPending = ref(false)
  const pending = computed(() =>
    isDemo.value ? demoData.pending.value : requestPending.value
  )
  const requestError = ref('')
  const error = computed(() =>
    isDemo.value ? text(demoData.error.value) : requestError.value
  )
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
    demoFinanceReport.value = null
    requestError.value = ''
    requestPending.value = false
    if (!canLoad.value) return

    if (isDemo.value) {
      const scenario = demoScenario.value
      if (!scenario?.finance) return
      const summary = projectKitchenDemoFinanceReport(
        scenario.finance,
        selectedPeriod.value
      )
      demoFinanceReport.value = summary

      report.value = {
        app_id: scenario.appId,
        kitchen_id: text(scenario.kitchen.id),
        period: {
          from: `${summary.periodFrom}T00:00:00.000Z`,
          to: `${summary.periodTo}T00:00:00.000Z`,
        },
        timezone: summary.timezone,
        generated_at: `${summary.asOfDate}T12:00:00.000Z`,
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
              amount_minor: summary.averageSaleMinor,
              currency_code: summary.currencyCode,
            },
            item_quantity: summary.itemQuantity,
            item_sales: {
              amount_minor: summary.itemSalesMinor,
              currency_code: summary.currencyCode,
            },
            delivery_fees: {
              amount_minor: summary.deliveryFeesMinor,
              currency_code: summary.currencyCode,
            },
            items: summary.topItems.map(item =>
              projectDemoFinanceItem(item, summary.currencyCode)
            ),
          },
        ],
        daily: summary.daily.map(day => ({
          date: day.date,
          sale_count: day.saleCount,
          currencies: [
            {
              currency_code: summary.currencyCode,
              sale_count: day.saleCount,
              gross_sales: {
                amount_minor: day.grossSalesMinor,
                currency_code: summary.currencyCode,
              },
              average_sale: {
                amount_minor: day.averageSaleMinor,
                currency_code: summary.currencyCode,
              },
              item_quantity: day.itemQuantity,
              item_sales: {
                amount_minor: day.itemSalesMinor,
                currency_code: summary.currencyCode,
              },
              delivery_fees: {
                amount_minor: day.deliveryFeesMinor,
                currency_code: summary.currencyCode,
              },
              items: day.items.map(item =>
                projectDemoFinanceItem(item, summary.currencyCode)
              ),
            },
          ],
        })),
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
      if (
        sequence !== requestSequence ||
        !isLive.value ||
        text(runtime.appId.value) !== appId ||
        text(selection.kitchenId.value) !== kitchenId ||
        currentUser.value?.uid !== user.uid
      ) {
        return
      }
      const response = await $fetch<KitchenGrossSalesReport>(
        '/api/console/kitchen/reports/gross-sales',
        {
          headers: { Authorization: `Bearer ${token}` },
          query: {
            app_id: appId,
            kitchen_id: kitchenId,
            period: selectedPeriod.value,
          },
        }
      )
      if (sequence !== requestSequence) return
      report.value = response
    } catch (caught) {
      if (sequence !== requestSequence) return
      requestError.value = reportErrorMessage(caught)
    } finally {
      if (sequence === requestSequence) requestPending.value = false
    }
  }

  watch(
    [
      currentUser,
      runtime.appId,
      runtime.dataType,
      selection.kitchenId,
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
    demoFinanceReport,
    pending,
    error,
    kitchenName,
    isLive,
    canLoad,
    refresh: load,
  }
}

function projectDemoFinanceItem(
  item: {
    menuId: string
    sourceItemId: string
    dishId: string
    itemKind?: string
    variantId?: string
    label: string
    variantLabel?: string
    quantity: number
    saleCount: number
    lineGrossMinor: number
  },
  currencyCode: string
): KitchenFinanceItemSummary {
  return {
    menu_id: item.menuId,
    source_item_id: item.sourceItemId,
    dish_id: item.dishId,
    ...(item.itemKind ? { item_kind: item.itemKind } : {}),
    ...(item.variantId ? { variant_id: item.variantId } : {}),
    label: item.label,
    ...(item.variantLabel ? { variant_label: item.variantLabel } : {}),
    quantity: item.quantity,
    sale_count: item.saleCount,
    line_gross: {
      amount_minor: item.lineGrossMinor,
      currency_code: currencyCode,
    },
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
