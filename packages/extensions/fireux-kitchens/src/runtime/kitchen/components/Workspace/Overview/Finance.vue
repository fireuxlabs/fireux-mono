<template>
  <section class="workspace-surface workspace-surface--compact">
    <p v-if="outcome === 'pending'" role="status">Loading sales…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Sales could not be loaded"
      :description="error"
    >
      <template #actions><FireCopyError :message="error" /></template>
    </UAlert>
    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Kitchen to view sales.
    </p>
    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UCard>
          <div class="card__header">
            <p>Gross sales</p>
            <UIcon name="i-lucide-banknote" />
          </div>
          <p class="mt-2 tabular-nums">
            {{ formatMoney(grossSalesMinor) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Completed checks</p>
            <UIcon name="i-lucide-receipt-text" />
          </div>
          <p class="mt-2 tabular-nums">
            {{ formatCount(completedChecks) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Average check</p>
            <UIcon name="i-lucide-calculator" />
          </div>
          <p class="mt-2 tabular-nums">
            {{ formatMoney(averageCheckMinor) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Items sold</p>
            <UIcon name="i-lucide-utensils" />
          </div>
          <p class="mt-2 tabular-nums">
            {{ formatCount(itemsSold) }}
          </p>
        </UCard>
      </div>

      <UCard v-if="currencySummary && salesTrend.points.length > 1">
        <FinanceReportTrend :trend="salesTrend" size="lg" />
      </UCard>

      <UCard>
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2>Transaction direction</h2>
            <p class="mt-1">
              Completed Kitchen sales are the current money-in source.
            </p>
          </div>

          <UFieldGroup size="sm" aria-label="Transaction direction">
            <UButton label="Money in" color="success" variant="solid" />
            <UButton
              label="Money out"
              color="neutral"
              variant="ghost"
              disabled
            />
          </UFieldGroup>
        </div>
        <p class="mt-3">
          No Kitchen-owned outgoing source is connected for this view.
        </p>
      </UCard>

      <div
        v-if="currencySummary"
        class="workspace-surface__grid workspace-surface__grid--2"
      >
        <UCard>
          <template #header>
            <h2>Sales by service</h2>
          </template>
          <ul class="divide-y divide-default">
            <li
              v-for="service in serviceBreakdown"
              :key="service.type"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div class="min-w-0">
                <p>
                  {{ formatTransactionType(service.type) }}
                </p>
                <p class="mt-0.5">{{ formatCount(service.checks) }} checks</p>
              </div>
              <p class="shrink-0 tabular-nums">
                {{ formatMoney(service.amountMinor) }}
              </p>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2>Best sellers</h2>
          </template>
          <ul class="divide-y divide-default">
            <li
              v-for="item in bestSellers"
              :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div class="min-w-0">
                <p class="truncate">
                  {{ item.label }}
                </p>
                <p class="mt-0.5">{{ formatCount(item.quantity) }} sold</p>
              </div>
              <p class="shrink-0 tabular-nums">
                {{ formatMoney(item.line_gross.amount_minor) }}
              </p>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2>
                {{
                  isSingleDay ? 'Today’s completed checks' : 'Completed checks'
                }}
              </h2>
              <p class="mt-1">
                {{ periodLabel }}
              </p>
            </div>

            <UFieldGroup size="sm" aria-label="Service type">
              <UButton
                v-for="option in serviceOptions"
                :key="option.value"
                :label="option.label"
                color="neutral"
                :variant="selectedService === option.value ? 'solid' : 'ghost'"
                :aria-pressed="selectedService === option.value"
                @click="selectedService = option.value"
              />
            </UFieldGroup>
          </div>
        </template>

        <div v-if="pending" class="p-4">
          <USkeleton class="h-48 w-full" />
        </div>

        <div v-else-if="error" class="p-4">
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Could not load the sales report"
            :description="error"
          />
        </div>

        <div
          v-else-if="currencySummary && filteredTransactions.length === 0"
          class="flex min-h-48 flex-col items-center justify-center px-6 py-10"
        >
          <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
          <p class="mt-3">No completed checks for this service</p>
        </div>

        <div
          v-else-if="!currencySummary"
          class="flex min-h-48 flex-col items-center justify-center px-6 py-10"
        >
          <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
          <p class="mt-3">No completed sales</p>
          <p class="mt-1">There is no money-in data for this period.</p>
        </div>

        <div v-else>
          <ul
            class="divide-y divide-default"
            :aria-label="`Completed checks for ${periodLabel}`"
          >
            <li
              v-for="transaction in filteredTransactions"
              :key="transaction.source.id"
              class="flex items-center gap-3 px-4 py-3.5"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10"
              >
                <UIcon name="i-lucide-arrow-down-left" aria-hidden="true" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="fx-card__chips">
                  <p class="truncate">
                    {{ transaction.summary }}
                  </p>
                  <UBadge color="success" variant="subtle" size="sm">
                    Completed
                  </UBadge>
                </div>
                <p class="mt-0.5 truncate">
                  {{ formatTransactionTime(transaction.occurred_at) }}
                  · {{ formatTransactionType(transaction.order_type) }} ·
                  {{ transaction.closed_by }} ·
                  {{ formatCount(transaction.item_quantity) }} items
                </p>
              </div>
              <p class="shrink-0 tabular-nums">
                {{ formatSignedMoney(transaction.signed_amount.amount_minor) }}
              </p>
              <UButton
                icon="i-lucide-search"
                color="neutral"
                variant="ghost"
                size="sm"
                :aria-label="`Inspect order ${transaction.order_number}`"
                @click="inspectTransaction(transaction)"
              />
            </li>
          </ul>
        </div>

        <template v-if="currencySummary && filteredTransactions.length" #footer>
          <div class="card__header">
            <span>
              {{ formatCount(filteredTransactions.length) }} completed checks
            </span>
            <span class="tabular-nums">
              {{ formatSignedMoney(filteredTotalMinor) }}
            </span>
          </div>
        </template>
      </UCard>

      <UModal
        v-model:open="transactionOpen"
        :title="
          selectedTransaction
            ? `Order #${selectedTransaction.order_number}`
            : 'Transaction details'
        "
        description="Completed sale"
        :ui="{ content: 'sm:max-w-md' }"
        @after:leave="selectedTransaction = null"
      >
        <template #body>
          <div v-if="selectedTransaction" class="workspace-surface">
            <div
              class="flex items-center justify-between gap-4 rounded-xl bg-elevated/50 p-4"
            >
              <div>
                <p>Money in</p>
                <p class="mt-1 tabular-nums">
                  {{
                    formatSignedMoney(
                      selectedTransaction.signed_amount.amount_minor
                    )
                  }}
                </p>
              </div>
              <span
                class="flex size-10 items-center justify-center rounded-full bg-success/10"
              >
                <UIcon name="i-lucide-arrow-down-left" aria-hidden="true" />
              </span>
            </div>

            <dl
              class="divide-y divide-default rounded-xl border border-default"
            >
              <div
                v-for="detail in selectedTransactionDetails"
                :key="detail.label"
                class="flex items-center justify-between gap-4 px-4 py-3"
              >
                <dt>
                  {{ detail.label }}
                </dt>
                <dd>
                  {{ detail.value }}
                </dd>
              </div>
            </dl>

            <section aria-labelledby="transaction-items-title">
              <div class="flex items-center justify-between gap-3">
                <h3 id="transaction-items-title">Items</h3>
                <span>
                  {{ formatCount(selectedTransaction.item_quantity) }}
                </span>
              </div>
              <ul
                class="mt-2 divide-y divide-default rounded-xl border border-default"
              >
                <li
                  v-for="(item, index) in selectedTransaction.items"
                  :key="`${item.label}:${index}`"
                  class="flex min-w-0 items-center gap-2 px-4 py-3"
                >
                  <span class="shrink-0 whitespace-nowrap tabular-nums">
                    {{ item.quantity }}×
                  </span>
                  <span class="min-w-0 flex-1 truncate">
                    {{ item.label }}
                  </span>
                  <span class="shrink-0 whitespace-nowrap tabular-nums">
                    {{ formatMoney(item.line_gross.amount_minor) }}
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </template>

        <template #footer>
          <div class="flex w-full justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              @click="transactionOpen = false"
            >
              Close
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </section>
</template>

<script setup lang="ts">
import FinanceReportTrend from 'fireux-finance/runtime/components/Finance/ReportTrend.vue'
import { useKitchenWorkspaceFinanceOverview } from '../../../composables/workspace/finance/useKitchenWorkspaceFinanceOverview'

const props = defineProps<{ fromDate: string; toDate: string }>()
const {
  pending,
  error,
  outcome,
  isSingleDay,
  periodLabel,
  currencySummary,
  grossSalesMinor,
  completedChecks,
  averageCheckMinor,
  itemsSold,
  salesTrend,
  serviceBreakdown,
  bestSellers,
  serviceOptions,
  selectedService,
  filteredTransactions,
  filteredTotalMinor,
  transactionOpen,
  selectedTransaction,
  selectedTransactionDetails,
  formatMoney,
  formatSignedMoney,
  formatCount,
  formatTransactionTime,
  formatTransactionType,
  inspectTransaction,
} = useKitchenWorkspaceFinanceOverview(props)
</script>
