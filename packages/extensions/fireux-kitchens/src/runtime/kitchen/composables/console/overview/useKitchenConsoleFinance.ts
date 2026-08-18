import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  KitchenFinanceCurrencySummary,
  KitchenFinanceItemSummary,
  KitchenGrossSalesReport,
} from '../../../models/finance-report.model.ts'
import type { KitchenDemoFinanceSource } from '../../../utils/demo-finance'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../core/useKitchenConsoleDemoData'
import { useKitchenConsole } from '../core/useKitchenConsole'

export type KitchenFinanceRangeMode = 'today' | 'last-week' | 'custom'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleFinance() {
  const { currentUser } = useAuth()
  const { selection, runtime } = useKitchenConsole()
  const isDemo = computed(() => selection.kitchenSource.value === 'demo')
  const isLive = computed(() => selection.kitchenSource.value === 'live')
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

  const rangeMode = ref<KitchenFinanceRangeMode>('today')
  const customFrom = ref('')
  const customTo = ref('')
  const report = ref<KitchenGrossSalesReport | null>(null)
  const requestPending = ref(false)
  const pending = computed(() =>
    isDemo.value ? demoData.pending.value : requestPending.value
  )
  const requestError = ref('')
  const validationError = computed(() => {
    if (rangeMode.value !== 'custom') return ''
    if (!customFrom.value || !customTo.value) {
      return 'Choose both dates.'
    }
    if (customFrom.value > customTo.value) {
      return 'The end date must be on or after the start date.'
    }
    const days = differenceInDays(customFrom.value, customTo.value) + 1
    return days > 93 ? 'Choose a range of 93 days or fewer.' : ''
  })
  const error = computed(() =>
    validationError.value
    || (isDemo.value ? text(demoData.error.value) : requestError.value)
  )
  const canLoad = computed(() => Boolean(
    !validationError.value
    && (
      isDemo.value
        ? demoScenario.value?.finance
        : isLive.value
          && text(runtime.appId.value)
          && text(selection.kitchenId.value)
          && currentUser.value
    )
  ))
  let requestSequence = 0

  function chooseRange(mode: KitchenFinanceRangeMode) {
    rangeMode.value = mode
    if (mode !== 'custom' || customFrom.value) return
    const anchor = demoScenario.value?.finance?.asOfDate ?? localIsoDate()
    customTo.value = anchor
    customFrom.value = addIsoDays(anchor, -6)
  }

  async function load() {
    const sequence = ++requestSequence
    report.value = null
    requestError.value = ''
    requestPending.value = false
    if (!canLoad.value) return

    if (isDemo.value) {
      const finance = demoScenario.value?.finance
      if (!finance) return
      const range = demoRange(finance, rangeMode.value, customFrom.value, customTo.value)
      report.value = projectDemoRange(
        demoScenario.value!.appId,
        text(demoScenario.value!.kitchen.id),
        finance,
        range.from,
        range.to
      )
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
      const query = rangeMode.value === 'custom'
        ? {
            app_id: appId,
            kitchen_id: kitchenId,
            from_date: customFrom.value,
            to_date: customTo.value,
          }
        : {
            app_id: appId,
            kitchen_id: kitchenId,
            preset: rangeMode.value,
          }
      report.value = await $fetch<KitchenGrossSalesReport>(
        '/api/console/kitchen/reports/gross-sales',
        {
          headers: { Authorization: `Bearer ${token}` },
          query,
        }
      )
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
      selection.kitchenId,
      selection.kitchenSource,
      rangeMode,
      customFrom,
      customTo,
      demoData.data,
    ],
    () => void load(),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestSequence += 1
  })

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

function demoRange(
  finance: KitchenDemoFinanceSource,
  mode: KitchenFinanceRangeMode,
  customFrom: string,
  customTo: string
) {
  if (mode === 'custom') return { from: customFrom, to: customTo }
  if (mode === 'today') {
    return { from: finance.asOfDate, to: finance.asOfDate }
  }
  const weekday = new Date(`${finance.asOfDate}T00:00:00.000Z`).getUTCDay()
  const thisMonday = addIsoDays(finance.asOfDate, -((weekday + 6) % 7))
  return {
    from: addIsoDays(thisMonday, -7),
    to: addIsoDays(thisMonday, -1),
  }
}

function projectDemoRange(
  appId: string,
  kitchenId: string,
  finance: KitchenDemoFinanceSource,
  from: string,
  to: string
): KitchenGrossSalesReport {
  const days = finance.dailyGrossSales.filter(day =>
    day.date >= from && day.date <= to
  )
  const items = new Map<string, KitchenFinanceItemSummary>()
  let saleCount = 0
  let itemQuantity = 0
  let grossSalesMinor = 0
  let itemSalesMinor = 0
  let deliveryFeesMinor = 0

  for (const day of days) {
    saleCount += day.saleCount
    itemQuantity += day.itemQuantity
    grossSalesMinor += day.grossSalesMinor
    itemSalesMinor += day.itemSalesMinor
    deliveryFeesMinor += day.deliveryFeesMinor
    for (const item of day.items) {
      const key = JSON.stringify([
        item.menuId,
        item.sourceItemId,
        item.dishId,
        item.variantId ?? '',
      ])
      const current = items.get(key)
      items.set(key, {
        menu_id: item.menuId,
        source_item_id: item.sourceItemId,
        dish_id: item.dishId,
        ...(item.itemKind ? { item_kind: item.itemKind } : {}),
        ...(item.variantId ? { variant_id: item.variantId } : {}),
        label: item.label,
        ...(item.variantLabel ? { variant_label: item.variantLabel } : {}),
        quantity: (current?.quantity ?? 0) + item.quantity,
        sale_count: (current?.sale_count ?? 0) + item.saleCount,
        line_gross: {
          amount_minor:
            (current?.line_gross.amount_minor ?? 0) + item.lineGrossMinor,
          currency_code: finance.currencyCode,
        },
      })
    }
  }

  const currency = (
    count: number,
    gross: number,
    quantity: number,
    itemSales: number,
    fees: number,
    rangeItems: KitchenFinanceItemSummary[]
  ): KitchenFinanceCurrencySummary => ({
    currency_code: finance.currencyCode,
    sale_count: count,
    gross_sales: { amount_minor: gross, currency_code: finance.currencyCode },
    average_sale: {
      amount_minor: count ? Math.round(gross / count) : 0,
      currency_code: finance.currencyCode,
    },
    item_quantity: quantity,
    item_sales: { amount_minor: itemSales, currency_code: finance.currencyCode },
    delivery_fees: { amount_minor: fees, currency_code: finance.currencyCode },
    items: rangeItems,
  })

  return {
    app_id: appId,
    kitchen_id: kitchenId,
    period: {
      from: `${from}T00:00:00.000Z`,
      to: `${addIsoDays(to, 1)}T00:00:00.000Z`,
    },
    timezone: finance.timezone,
    generated_at: `${finance.asOfDate}T12:00:00.000Z`,
    sale_count: saleCount,
    currencies: saleCount
      ? [currency(
          saleCount,
          grossSalesMinor,
          itemQuantity,
          itemSalesMinor,
          deliveryFeesMinor,
          [...items.values()].sort((a, b) =>
            b.line_gross.amount_minor - a.line_gross.amount_minor
          )
        )]
      : [],
    daily: days.map(day => ({
      date: day.date,
      sale_count: day.saleCount,
      currencies: [currency(
        day.saleCount,
        day.grossSalesMinor,
        day.itemQuantity,
        day.itemSalesMinor,
        day.deliveryFeesMinor,
        day.items.map(item => ({
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
            currency_code: finance.currencyCode,
          },
        }))
      )],
    })),
    transactions: days
      .flatMap(day => day.transactions)
      .map(transaction => ({
        source: {
          kind: transaction.source.kind,
          id: transaction.source.id,
          service_id: transaction.source.serviceId,
          service_number: transaction.source.serviceNumber,
        },
        order_number: transaction.orderNumber,
        placed_at: transaction.placedAt,
        occurred_at: transaction.occurredAt,
        status: transaction.status,
        order_type: transaction.orderType,
        channel: transaction.channel,
        closed_by: transaction.closedBy,
        counterparty: transaction.counterparty,
        summary: transaction.summary,
        item_quantity: transaction.itemQuantity,
        signed_amount: {
          amount_minor: transaction.signedAmountMinor,
          currency_code: finance.currencyCode,
        },
        gross_sale: {
          amount_minor: transaction.grossSalesMinor,
          currency_code: finance.currencyCode,
        },
        items: transaction.items.map(item => ({
          label: item.label,
          quantity: item.quantity,
          line_gross: {
            amount_minor: item.lineGrossMinor,
            currency_code: finance.currencyCode,
          },
        })),
      }))
      .sort((left, right) =>
        right.occurred_at.localeCompare(left.occurred_at)
        || right.order_number.localeCompare(left.order_number)
      ),
    complete: true,
  }
}

function localIsoDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function addIsoDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function differenceInDays(from: string, to: string) {
  return Math.round(
    (
      new Date(`${to}T00:00:00.000Z`).getTime()
      - new Date(`${from}T00:00:00.000Z`).getTime()
    ) / 86_400_000
  )
}

function reportErrorMessage(error: unknown) {
  const source = error && typeof error === 'object'
    ? error as {
        data?: { message?: unknown; statusMessage?: unknown }
        message?: unknown
        statusMessage?: unknown
      }
    : {}
  return text(
    source.data?.statusMessage
    || source.data?.message
    || source.statusMessage
    || source.message
  ) || 'The Finance report could not be loaded.'
}
