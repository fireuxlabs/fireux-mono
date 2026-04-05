<template>
  <UDashboardPanel id="console-portfolio-finance">
    <template #header>
      <LayoutsConsoleNavbar title="Financial Signals" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio before using financial signals."
          :actions="[
            {
              label: 'Go to portfolios',
              to: '/console/portfolio',
              icon: 'i-lucide-arrow-right'
            }
          ]"
        />

        <template v-else>
          <UCard>
            <div class="text-xs text-dimmed">
              Mode: <span class="font-medium">{{ runtimeMode }}</span>
              · Source:
              <code>{{ isDemo ? 'demo scenario' : financialsPath }}</code>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Portfolio Financial Signals</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="item in cards"
                :key="item.key"
                class="rounded border border-default p-3"
              >
                <div class="text-xs text-dimmed">{{ item.label }}</div>
                <div class="text-lg font-semibold">{{ item.value }}</div>
                <div v-if="item.hint" class="text-xs text-dimmed">{{ item.hint }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Monthly Trend (Last 6)</div>
            </template>

            <div v-if="monthlyTrend.length" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="entry in monthlyTrend"
                :key="entry.month"
                class="rounded border border-default p-3"
              >
                <div class="text-xs text-dimmed">{{ entry.label }}</div>
                <div class="text-sm font-semibold">
                  {{ formatMoney(entry.received, currency) }} / {{ formatMoney(entry.expected, currency) }}
                </div>
                <div class="text-xs text-dimmed">
                  NOI {{ formatMoney(entry.noi, currency) }}
                  · Capex {{ formatMoney(entry.capex, currency) }}
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No monthly trend data"
              description="No transaction line items are available for this runtime."
            />
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Arrears Watchlist</div>
            </template>

            <div v-if="arrearsTenants.length" class="space-y-2">
              <div
                v-for="tenant in arrearsTenants"
                :key="tenant.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold">{{ tenant.display_name }}</div>
                    <div class="text-xs text-dimmed">
                      {{ propertyNameById.get(tenant.property_id) || tenant.property_id }} · {{ tenant.unit_id }}
                    </div>
                  </div>
                  <UBadge color="error" variant="soft">
                    {{ formatMoney(Number(tenant.monthly_rent || 0), tenant.currency || currency) }}
                  </UBadge>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No arrears tenants"
              description="No tenant in arrears in this runtime scenario."
            />
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Renewals (next 90 days)</div>
            </template>

            <div v-if="renewals.length" class="space-y-2">
              <div
                v-for="lease in renewals"
                :key="lease.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold">{{ propertyNameById.get(lease.property_id) || lease.property_id }}</div>
                    <div class="text-xs text-dimmed">Lease ends {{ lease.end_date }}</div>
                  </div>
                  <UBadge :color="lease.urgency <= 30 ? 'warning' : 'neutral'" variant="soft">
                    {{ lease.urgency }} days
                  </UBadge>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No renewals due"
              description="No lease renewals in the next 90 days."
            />
          </UCard>
        </template>

        <DevJson
          v-if="isDev"
          title="Financial Signals (JSON)"
          context="console/portfolio/finance · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { usePortfolioPropertyCollection } from '../../../composables/fireux/firestore/property/fetch/usePortfolioPropertyCollection'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-finance',
    label: 'Financial Signals',
    icon: 'i-lucide-chart-line',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const { collection: propertyCollection } = usePortfolioPropertyCollection(runtimePortfolio)
const isDev = import.meta.dev
const financialsPath = useRuntimePortfolioPath(runtimePortfolio, 'financials')

const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isDemo = computed(() => runtimePortfolio.isDemo.value)
const scenario = computed(() => runtimePortfolio.scenario.value)

const properties = computed(() => propertyCollection.value)
const tenants = computed(() => scenario.value?.tenants ?? [])
const leases = computed(() => scenario.value?.leases ?? [])
const financials = computed(() => scenario.value?.financials ?? null)
const transactions = computed(() => scenario.value?.transactions ?? [])

const propertyNameById = computed(() => {
  const map = new Map<string, string>()
  for (const property of properties.value) {
    const id = String(property.id || '').trim()
    if (!id) continue
    map.set(id, String(property.name || id).trim())
  }
  return map
})

const currency = computed(() => String(financials.value?.currency || 'GBP').trim() || 'GBP')

const formatMoney = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

const daysUntil = (value: string) => {
  const parsed = new Date(String(value || '').trim())
  if (Number.isNaN(parsed.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((parsed.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

const arrearsTenants = computed(() => tenants.value.filter((tenant) => tenant.status === 'arrears'))
const arrearsTotal = computed(() =>
  arrearsTenants.value.reduce((sum, tenant) => sum + Number(tenant.monthly_rent || 0), 0)
)

const renewals = computed(() =>
  leases.value
    .map((lease) => ({ lease, urgency: daysUntil(lease.end_date) }))
    .filter((entry): entry is { lease: (typeof leases.value)[number]; urgency: number } =>
      typeof entry.urgency === 'number' && entry.urgency >= 0 && entry.urgency <= 90
    )
    .sort((a, b) => a.urgency - b.urgency)
    .map((entry) => ({ ...entry.lease, urgency: entry.urgency }))
)

const transactionMonth = (dateValue: string) => String(dateValue || '').trim().slice(0, 7)

const monthlyTrend = computed(() => {
  const monthKeys = Array.from(
    new Set(transactions.value.map((entry) => transactionMonth(entry.occurred_on)).filter(Boolean))
  )
    .sort()
    .slice(-6)

  return monthKeys.map((month) => {
    const monthRows = transactions.value.filter(
      (entry) => transactionMonth(entry.occurred_on) === month
    )

    const expected = monthRows
      .filter((entry) => entry.type === 'rent_expected')
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const received = monthRows
      .filter((entry) => entry.type === 'rent_received')
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const opex = monthRows
      .filter((entry) => entry.type === 'opex')
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const capex = monthRows
      .filter((entry) => entry.type === 'capex')
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

    const [yearRaw, monthRaw] = month.split('-')
    const year = Number(yearRaw)
    const monthIndex = Number(monthRaw) - 1
    const label =
      Number.isFinite(year) && Number.isFinite(monthIndex) && monthIndex >= 0
        ? new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          })
        : month

    return {
      month,
      label,
      expected,
      received,
      opex,
      capex,
      noi: received - opex - capex,
    }
  })
})

const latestMonth = computed(() => {
  const list = monthlyTrend.value
  return list.length ? list[list.length - 1] : null
})

const cards = computed(() => {
  const gross = Number(latestMonth.value?.expected || 0) || Number(financials.value?.gross_rent_monthly || 0)
  const collected = Number(latestMonth.value?.received || 0) || Math.max(0, gross - arrearsTotal.value)
  const opex =
    Number(latestMonth.value ? latestMonth.value.opex + latestMonth.value.capex : 0) ||
    Number(financials.value?.opex_monthly || 0)
  const net =
    Number(latestMonth.value?.noi || 0) || Number(financials.value?.net_cashflow_monthly || collected - opex)
  const occupancy = Number(financials.value?.occupancy_rate || 0)

  return [
    {
      key: 'gross-rent',
      label: 'Gross Rent (Monthly)',
      value: formatMoney(gross, currency.value),
      hint: financials.value?.period_label || '',
    },
    {
      key: 'arrears',
      label: 'Arrears Exposure',
      value: formatMoney(arrearsTotal.value, currency.value),
      hint: `${arrearsTenants.value.length} tenant(s)`,
    },
    {
      key: 'opex',
      label: 'Operating Costs',
      value: formatMoney(opex, currency.value),
    },
    {
      key: 'noi',
      label: 'NOI (Monthly)',
      value: formatMoney(net, currency.value),
    },
    {
      key: 'occupancy',
      label: 'Occupancy Rate',
      value: `${(occupancy * 100).toFixed(1)}%`,
    },
    {
      key: 'invoices',
      label: 'Upcoming Invoices',
      value: formatMoney(Number(financials.value?.upcoming_invoices_total || 0), currency.value),
    },
    {
      key: 'renewals',
      label: 'Renewals (90d)',
      value: String(renewals.value.length),
    },
    {
      key: 'collection-rate',
      label: 'Collection Rate',
      value:
        gross > 0
          ? `${((collected / gross) * 100).toFixed(1)}%`
          : 'n/a',
    },
  ]
})

const runtimeSnapshot = computed(() => ({
  id: runtimePortfolio.id.value,
  mode: runtimePortfolio.mode.value,
  isDemo: runtimePortfolio.isDemo.value,
  scenario: runtimePortfolio.scenario.value,
  financials: financials.value,
  transactions: transactions.value,
  monthlyTrend: monthlyTrend.value,
  arrearsTenants: arrearsTenants.value,
  renewals: renewals.value,
}))
</script>
