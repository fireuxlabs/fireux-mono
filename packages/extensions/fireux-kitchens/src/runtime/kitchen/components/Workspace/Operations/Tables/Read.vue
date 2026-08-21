<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <UCard v-for="summary in summaries" :key="summary.label">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="m-0 text-xs font-bold text-muted">{{ summary.label }}</p>
            <strong class="text-2xl font-black text-highlighted">
              {{ summary.count }}
            </strong>
          </div>
          <UIcon :name="summary.icon" class="size-5 text-primary" />
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="m-0 text-lg font-black text-highlighted">Tables</h2>
            <p class="m-0 text-sm text-muted">
              Front-of-house tabs, staged rounds, and end-of-service billing.
            </p>
          </div>
          <UBadge variant="soft">{{ tableRows.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="m-0 text-sm font-semibold text-muted">
        Loading table tabs...
      </p>

      <div
        v-else-if="tableRows.length"
        class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="row in tableRows"
          :key="row.key"
          class="grid gap-3 rounded-lg border border-default bg-elevated/40 p-4"
        >
          <header class="flex items-start justify-between gap-3">
            <div>
              <h3 class="m-0 text-lg font-black text-highlighted">
                {{ row.label }}
              </h3>
              <p class="m-0 text-xs font-semibold text-muted">
                {{ row.tab ? roundLabel(row.tab) : 'No open tab' }}
              </p>
            </div>
            <UBadge
              :color="row.tab ? statusColor(row.tab.status) : 'neutral'"
              variant="soft"
            >
              {{ row.tab ? statusLabel(row.tab.status) : 'available' }}
            </UBadge>
          </header>

          <dl class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt class="text-muted">Guests</dt>
              <dd class="m-0 font-black text-highlighted">
                {{ row.tab?.guest_count || 0 }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Staged items</dt>
              <dd class="m-0 font-black text-highlighted">
                {{ row.tab?.staged_line_count || 0 }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Sent rounds</dt>
              <dd class="m-0 font-black text-highlighted">
                {{ row.tab?.submitted_round_count || 0 }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Outstanding</dt>
              <dd class="m-0 font-black text-highlighted">
                {{ row.tab ? money(row.tab) : '—' }}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <p v-else class="m-0 text-sm text-muted">No table tabs are open.</p>
    </UCard>

    <DevDebugPanel
      title="Kitchen tables"
      scope="workspace"
      object-origin="fetched"
      :objects="{ activeTabs, stagingTabs, billingTabs }"
      :derived="debug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenTableTab,
  KitchenTableTabStatus,
} from '../../../../models/table-tab.model.ts'
import { useKitchenWorkspaceTables } from '../../../../composables/workspace/operations/Tables/useKitchenWorkspaceTables'

const { activeTabs, stagingTabs, billingTabs, tableCount, pending, debug } =
  useKitchenWorkspaceTables()

const summaries = computed(() => [
  {
    label: 'Open tables',
    count: activeTabs.value.length,
    icon: 'i-lucide-layout-grid',
  },
  {
    label: 'Staging rounds',
    count: stagingTabs.value.length,
    icon: 'i-lucide-list-plus',
  },
  {
    label: 'Billing',
    count: billingTabs.value.length,
    icon: 'i-lucide-receipt',
  },
])
const sortedTabs = computed(() =>
  [...activeTabs.value].sort((left, right) =>
    String(left.table_label || '').localeCompare(
      String(right.table_label || ''),
      undefined,
      {
        numeric: true,
      }
    )
  )
)
const normalizedTableNumber = (tab: KitchenTableTab) => {
  const source = String(tab.table_id || tab.table_label || '').trim()
  const match = source.match(/(?:table\s*)?(\d+)$/i)
  return match ? Number(match[1]) : 0
}
const tableRows = computed(() => {
  const configured = Array.from({ length: tableCount.value }, (_, index) => {
    const number = index + 1
    const tab = sortedTabs.value.find(
      (candidate) => normalizedTableNumber(candidate) === number
    )

    return {
      key: `table-${number}`,
      label: `Table ${number}`,
      tab,
    }
  })
  const unconfigured = sortedTabs.value
    .filter((tab) => {
      const number = normalizedTableNumber(tab)
      return !number || number > tableCount.value
    })
    .map((tab) => ({
      key: tab.id,
      label: tab.table_label || 'Unlabelled table',
      tab,
    }))

  return [...configured, ...unconfigured]
})
const statusLabel = (status: KitchenTableTabStatus) =>
  String(status || 'open').replace(/_/g, ' ')
const statusColor = (status: KitchenTableTabStatus) => {
  if (status === 'paid') return 'success' as const
  if (status === 'bill_requested' || status === 'payment_pending')
    return 'warning' as const
  return 'neutral' as const
}
const roundLabel = (tab: KitchenTableTab) => {
  if (!tab.current_round_number) return 'No round open'
  return `Round ${tab.current_round_number} · ${String(tab.current_round_status).replace(/_/g, ' ')}`
}
const money = (tab: KitchenTableTab) => {
  const currency = String(tab.currency_code || 'CHF').toUpperCase()
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(Number(tab.outstanding_chf || 0))
}
</script>
