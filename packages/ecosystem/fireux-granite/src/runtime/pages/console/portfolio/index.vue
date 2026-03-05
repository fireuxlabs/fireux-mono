<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Hub" />
    </template>

    <template #body>
      <section class="space-y-8">
        <PortfolioCTA v-if="!runtimeId" />

        <template v-else>
          <div class="text-xs text-dimmed">
            Mode: <span class="font-medium">{{ runtimeMode }}</span>
            · Portfolio: <span class="font-mono">{{ runtimeId }}</span>
          </div>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Signals Board</div>
            </template>

            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="item in signals"
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
              <div class="text-sm font-semibold">Attention Queue</div>
            </template>

            <div v-if="attentionQueue.length" class="space-y-2">
              <div
                v-for="item in attentionQueue"
                :key="item.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                  </div>

                  <UBadge :color="attentionBadgeColor(item.level)" variant="soft">
                    {{ item.level }}
                  </UBadge>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No active pressure points"
              description="No overdue exposure found for the current runtime context."
            />
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Portfolio Map</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="space-y-2">
                <div class="text-xs font-semibold text-dimmed">Top arrears</div>
                <div v-if="topArrearsProperties.length" class="space-y-2">
                  <div
                    v-for="item in topArrearsProperties"
                    :key="item.propertyId"
                    class="rounded border border-default p-2"
                  >
                    <div class="text-sm font-medium">{{ item.label }}</div>
                    <div class="text-xs text-dimmed">{{ item.value }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-dimmed">No arrears.</div>
              </div>

              <div class="space-y-2">
                <div class="text-xs font-semibold text-dimmed">Top incidents</div>
                <div v-if="topIncidentProperties.length" class="space-y-2">
                  <div
                    v-for="item in topIncidentProperties"
                    :key="item.propertyId"
                    class="rounded border border-default p-2"
                  >
                    <div class="text-sm font-medium">{{ item.label }}</div>
                    <div class="text-xs text-dimmed">{{ item.value }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-dimmed">No open incidents.</div>
              </div>

              <div class="space-y-2">
                <div class="text-xs font-semibold text-dimmed">Top compliance risk</div>
                <div v-if="topComplianceProperties.length" class="space-y-2">
                  <div
                    v-for="item in topComplianceProperties"
                    :key="item.propertyId"
                    class="rounded border border-default p-2"
                  >
                    <div class="text-sm font-medium">{{ item.label }}</div>
                    <div class="text-xs text-dimmed">{{ item.value }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-dimmed">No compliance risk.</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Console Surfaces</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <UButton to="/console/portfolio/properties" variant="soft" icon="i-lucide-building" block>
                Properties
              </UButton>
              <UButton to="/console/portfolio/clients" variant="soft" icon="i-lucide-users" block>
                Clients
              </UButton>
              <UButton to="/console/portfolio/finance" variant="soft" icon="i-lucide-chart-line" block>
                Financial Signals
              </UButton>
              <UButton to="/console/portfolio/compliance" variant="soft" icon="i-lucide-shield-alert" block>
                Compliance Exposure
              </UButton>
              <UButton to="/console/portfolio/incidents" variant="soft" icon="i-lucide-triangle-alert" block>
                Incidents
              </UButton>
              <UButton to="/console/portfolio/documents" variant="soft" icon="i-lucide-file-text" block>
                Documents
              </UButton>
              <UButton to="/console/portfolio/tasks" variant="soft" icon="i-lucide-list-checks" block>
                Tasks
              </UButton>
            </div>
          </UCard>
        </template>

        <DevJson
          v-if="isDev"
          title="Portfolio Runtime (JSON)"
          context="console/portfolio/index · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { usePropertyCollection } from 'fireux-properties/runtime/composables/fireux/firestore/property/fetch/usePropertyCollection'
import { useComplianceRecordCollection } from 'fireux-compliance/runtime/composables/fireux/firestore/compliance/fetch/useComplianceRecordCollection'
import { deriveComplianceStatus } from 'fireux-compliance/runtime/composables/fireux/firestore/compliance/utils/status/useComplianceStatus'
import { useDocumentLinkCollection } from 'fireux-documents/runtime/composables/fireux/firestore/documents/fetch/useDocumentLinkCollection'
import { useTaskCollection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/fetch/useTaskCollection'

type SignalCard = {
  key: string
  label: string
  value: string
  hint?: string
}

type AttentionLevel = 'high' | 'medium' | 'low'

type AttentionItem = {
  id: string
  title: string
  subtitle: string
  level: AttentionLevel
  score: number
}

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-home',
    label: 'Hub',
    icon: 'i-lucide-terminal',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const isDev = import.meta.dev
const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const scenario = computed(() => runtimePortfolio.scenario.value)

const { collection: properties } = usePropertyCollection(runtimePortfolio)
const { collection: complianceRecords } = useComplianceRecordCollection(runtimePortfolio)
const { collection: documentLinks } = useDocumentLinkCollection(runtimePortfolio)
const { collection: tasks } = useTaskCollection(runtimePortfolio)

const scenarioTenants = computed(() => scenario.value?.tenants ?? [])
const scenarioLeases = computed(() => scenario.value?.leases ?? [])
const scenarioMaintenance = computed(() => scenario.value?.maintenance ?? [])
const scenarioFinancials = computed(() => scenario.value?.financials ?? null)
const scenarioTransactions = computed(() => scenario.value?.transactions ?? [])

const propertyNameById = computed(() => {
  const map = new Map<string, string>()
  for (const property of properties.value) {
    const id = String(property.id || '').trim()
    if (!id) continue
    map.set(id, String(property.name || id).trim())
  }
  return map
})

const currencyCode = computed(() => String(scenarioFinancials.value?.currency || 'GBP').trim() || 'GBP')

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))

const todayStartMs = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

const daysUntil = (value: string) => {
  const parsed = new Date(String(value || '').trim())
  if (Number.isNaN(parsed.getTime())) return null
  const diffMs = parsed.getTime() - todayStartMs()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

const complianceAlerts = computed(() =>
  complianceRecords.value.filter((record) => {
    const status = deriveComplianceStatus(record.expiry_date, { dueSoonDays: 30 })
    return status === 'dueSoon' || status === 'overdue'
  }).length
)

const complianceRiskScore = computed(() => {
  let score = 0
  for (const record of complianceRecords.value) {
    const status = deriveComplianceStatus(record.expiry_date, { dueSoonDays: 30 })
    if (status === 'overdue') score += 3
    if (status === 'dueSoon') score += 1
  }
  return score
})

const openTasks = computed(() => tasks.value.filter((task) => task.status !== 'done').length)

const openIncidents = computed(() =>
  scenarioMaintenance.value.filter((ticket) => ticket.status !== 'done').length
)

const capexBacklog = computed(() =>
  scenarioMaintenance.value.filter(
    (ticket) => ticket.status !== 'done' && ticket.priority === 'high'
  ).length
)

const renewals90 = computed(() =>
  scenarioLeases.value.filter((lease) => {
    const days = daysUntil(lease.end_date)
    if (days === null) return false
    return days >= 0 && days <= 90
  }).length
)

const arrearsTenants = computed(() =>
  scenarioTenants.value.filter((tenant) => tenant.status === 'arrears')
)

const arrearsTotal = computed(() =>
  arrearsTenants.value.reduce((sum, tenant) => sum + Number(tenant.monthly_rent || 0), 0)
)

const unitTotals = computed(() => {
  const units = scenario.value?.units ?? []
  if (!units.length) return { vacant: 0, total: 0 }

  const total = units.length
  const vacant = units.filter((unit) => String(unit.status || '') === 'vacant').length
  return { vacant, total }
})

const transactionMonth = (dateValue: string) => String(dateValue || '').trim().slice(0, 7)

const monthlySignals = computed(() => {
  const monthKeys = Array.from(
    new Set(
      scenarioTransactions.value
        .map((entry) => transactionMonth(entry.occurred_on))
        .filter(Boolean)
    )
  ).sort()

  return monthKeys.map((month) => {
    const monthRows = scenarioTransactions.value.filter(
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

    return { month, expected, received, opex, capex, noi: received - opex - capex }
  })
})

const latestMonthSignal = computed(() => {
  const list = monthlySignals.value
  return list.length ? list[list.length - 1] : null
})

const signals = computed<SignalCard[]>(() => {
  const expected =
    Number(latestMonthSignal.value?.expected || 0) ||
    Number(scenarioFinancials.value?.gross_rent_monthly || 0)
  const collected =
    Number(latestMonthSignal.value?.received || 0) ||
    Math.max(0, expected - arrearsTotal.value)
  const collectionRate = expected > 0 ? `${((collected / expected) * 100).toFixed(1)}%` : 'n/a'

  const occupancyRate = Number(scenarioFinancials.value?.occupancy_rate || 0)
  const occupancyLabel =
    occupancyRate > 0
      ? `${(occupancyRate * 100).toFixed(1)}%`
      : unitTotals.value.total > 0
        ? `${(((unitTotals.value.total - unitTotals.value.vacant) / unitTotals.value.total) * 100).toFixed(1)}%`
        : 'n/a'

  const noi =
    Number(latestMonthSignal.value?.noi || 0) ||
    Number(scenarioFinancials.value?.net_cashflow_monthly || 0)

  return [
    {
      key: 'collected-vs-expected',
      label: 'Collected vs Expected',
      value: `${formatMoney(collected, currencyCode.value)} / ${formatMoney(expected, currencyCode.value)}`,
      hint: collectionRate,
    },
    {
      key: 'arrears',
      label: 'Arrears Exposure',
      value: formatMoney(arrearsTotal.value, currencyCode.value),
      hint: `${arrearsTenants.value.length} tenant(s)`,
    },
    {
      key: 'void-rate',
      label: 'Void / Occupancy',
      value: occupancyLabel,
      hint:
        unitTotals.value.total > 0
          ? `${unitTotals.value.vacant} vacant of ${unitTotals.value.total}`
          : undefined,
    },
    {
      key: 'noi',
      label: 'NOI (Monthly)',
      value: formatMoney(noi, currencyCode.value),
      hint: scenarioFinancials.value?.period_label || '',
    },
    {
      key: 'renewals',
      label: 'Renewals (90d)',
      value: String(renewals90.value),
    },
    {
      key: 'capex-backlog',
      label: 'Capex Backlog',
      value: String(capexBacklog.value),
      hint: 'High-priority open tickets',
    },
    {
      key: 'compliance-risk',
      label: 'Compliance Exposure',
      value: String(complianceRiskScore.value),
      hint: `${complianceAlerts.value} due/overdue`,
    },
    {
      key: 'incidents',
      label: 'Open Incidents',
      value: String(openIncidents.value),
    },
    {
      key: 'open-tasks',
      label: 'Open Tasks',
      value: String(openTasks.value),
    },
    {
      key: 'documents',
      label: 'Document Links',
      value: String(documentLinks.value.length),
    },
  ]
})

const attentionQueue = computed<AttentionItem[]>(() => {
  const queue: AttentionItem[] = []

  for (const tenant of arrearsTenants.value) {
    queue.push({
      id: `arrears-${tenant.id}`,
      title: `${tenant.display_name} in arrears`,
      subtitle: `${propertyNameById.value.get(tenant.property_id) || tenant.property_id} · ${formatMoney(Number(tenant.monthly_rent || 0), String(tenant.currency || currencyCode.value))}`,
      level: 'high',
      score: 100,
    })
  }

  for (const record of complianceRecords.value) {
    const status = deriveComplianceStatus(record.expiry_date, { dueSoonDays: 30 })
    if (status !== 'overdue' && status !== 'dueSoon') continue

    const level: AttentionLevel = status === 'overdue' ? 'high' : 'medium'
    const score = status === 'overdue' ? 90 : 70
    queue.push({
      id: `compliance-${record.id}`,
      title: `${record.type_label} ${status === 'overdue' ? 'overdue' : 'due soon'}`,
      subtitle: `${propertyNameById.value.get(record.property_id) || record.property_id} · expires ${record.expiry_date || 'n/a'}`,
      level,
      score,
    })
  }

  for (const ticket of scenarioMaintenance.value) {
    if (ticket.status === 'done') continue
    const level: AttentionLevel = ticket.priority === 'high' ? 'high' : 'medium'
    const score = ticket.priority === 'high' ? 85 : 65
    queue.push({
      id: `incident-${ticket.id}`,
      title: ticket.title,
      subtitle: `${propertyNameById.value.get(ticket.property_id) || ticket.property_id} · ${ticket.category} · ${ticket.status}`,
      level,
      score,
    })
  }

  for (const lease of scenarioLeases.value) {
    const days = daysUntil(lease.end_date)
    if (days === null || days < 0 || days > 90) continue

    const level: AttentionLevel = days <= 30 ? 'high' : 'medium'
    const score = days <= 30 ? 80 : 60
    queue.push({
      id: `renewal-${lease.id}`,
      title: 'Lease renewal window',
      subtitle: `${propertyNameById.value.get(lease.property_id) || lease.property_id} · ${days} day(s) to end date`,
      level,
      score,
    })
  }

  return queue
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
})

const topArrearsProperties = computed(() => {
  const byProperty = new Map<string, number>()
  for (const tenant of arrearsTenants.value) {
    const key = String(tenant.property_id || '').trim()
    if (!key) continue
    byProperty.set(key, (byProperty.get(key) || 0) + Number(tenant.monthly_rent || 0))
  }

  return Array.from(byProperty.entries())
    .map(([propertyId, amount]) => ({
      propertyId,
      label: propertyNameById.value.get(propertyId) || propertyId,
      value: formatMoney(amount, currencyCode.value),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
})

const topIncidentProperties = computed(() => {
  const byProperty = new Map<string, number>()
  for (const ticket of scenarioMaintenance.value) {
    if (ticket.status === 'done') continue
    const key = String(ticket.property_id || '').trim()
    if (!key) continue
    byProperty.set(key, (byProperty.get(key) || 0) + 1)
  }

  return Array.from(byProperty.entries())
    .map(([propertyId, count]) => ({
      propertyId,
      label: propertyNameById.value.get(propertyId) || propertyId,
      value: `${count} open ticket(s)`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
})

const topComplianceProperties = computed(() => {
  const byProperty = new Map<string, number>()

  for (const record of complianceRecords.value) {
    const key = String(record.property_id || '').trim()
    if (!key) continue

    const status = deriveComplianceStatus(record.expiry_date, { dueSoonDays: 30 })
    const weight = status === 'overdue' ? 3 : status === 'dueSoon' ? 1 : 0
    if (!weight) continue

    byProperty.set(key, (byProperty.get(key) || 0) + weight)
  }

  return Array.from(byProperty.entries())
    .map(([propertyId, score]) => ({
      propertyId,
      label: propertyNameById.value.get(propertyId) || propertyId,
      value: `risk score ${score}`,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
})

const attentionBadgeColor = (level: AttentionLevel) => {
  if (level === 'high') return 'error'
  if (level === 'medium') return 'warning'
  return 'neutral'
}

const runtimeSnapshot = computed(() => ({
  id: runtimePortfolio.id.value,
  mode: runtimePortfolio.mode.value,
  isReadOnly: runtimePortfolio.isReadOnly.value,
  collectionPath: runtimePortfolio.collectionPath.value,
  pending: runtimePortfolio.pending.value,
  isLoading: runtimePortfolio.isLoading.value,
  isReady: runtimePortfolio.isReady.value,
  doc: runtimePortfolio.doc.value,
  scenario: runtimePortfolio.scenario.value,
  data: runtimePortfolio.data.value,
  signals: signals.value,
  counts: {
    properties: properties.value.length,
    complianceRecords: complianceRecords.value.length,
    documentLinks: documentLinks.value.length,
    tasks: tasks.value.length,
    tenants: scenarioTenants.value.length,
    leases: scenarioLeases.value.length,
    maintenance: scenarioMaintenance.value.length,
    transactions: scenarioTransactions.value.length,
  },
}))
</script>
