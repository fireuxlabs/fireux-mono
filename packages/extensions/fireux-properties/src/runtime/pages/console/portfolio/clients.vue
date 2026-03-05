<template>
  <UDashboardPanel id="console-portfolio-clients">
    <template #header>
      <LayoutsConsoleNavbar title="Clients" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio before viewing clients."
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
              <code>{{ isReadOnly ? 'read-only scenario' : `portfolios/${runtimeId}/clients` }}</code>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Client Signals</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Client entities</div>
                <div class="text-xl font-semibold">{{ summary.total }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">In arrears</div>
                <div class="text-xl font-semibold">{{ summary.arrears }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Ending soon</div>
                <div class="text-xl font-semibold">{{ summary.endingSoon }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Monthly exposure</div>
                <div class="text-xl font-semibold">{{ formatMoney(summary.monthlyExposure, currency) }}</div>
              </div>
            </div>
          </UCard>

          <ClientCollectionManager
            :collection="clients"
            title="Client Collection"
            description="Portfolio-scoped clients."
          />
        </template>

        <DevJson
          v-if="isDev"
          title="Clients (JSON)"
          context="console/portfolio/clients · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimePortfolio } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { useClientCollection } from '../../../composables/fireux/firestore/client/fetch/useClientCollection'
import ClientCollectionManager from '../../../components/organisms/Client/Collection/Manager.vue'

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-clients',
    label: 'Clients',
    icon: 'i-lucide-buildings',
    order: 22,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const { collection: clientCollection } = useClientCollection(runtimePortfolio)
const isDev = import.meta.dev

const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isReadOnly = computed(() => runtimePortfolio.isReadOnly.value)
const clients = computed(() => clientCollection.value)
const currency = computed(
  () => String(clients.value[0]?.currency || runtimePortfolio.scenario.value?.financials?.currency || 'GBP').trim() || 'GBP'
)

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

const summary = computed(() => {
  const total = clients.value.length
  const arrears = clients.value.filter((client) => client.status === 'arrears').length
  const endingSoon = clients.value.filter((client) => {
    const days = daysUntil(client.lease_end_date)
    return typeof days === 'number' && days >= 0 && days <= 90
  }).length
  const monthlyExposure = clients.value.reduce(
    (sum, client) => sum + Number(client.monthly_rent || 0),
    0
  )

  return { total, arrears, endingSoon, monthlyExposure }
})

const runtimeSnapshot = computed(() => ({
  id: runtimePortfolio.id.value,
  mode: runtimePortfolio.mode.value,
  isReadOnly: runtimePortfolio.isReadOnly.value,
  scenario: runtimePortfolio.scenario.value,
  clients: clients.value,
  summary: summary.value,
}))
</script>
