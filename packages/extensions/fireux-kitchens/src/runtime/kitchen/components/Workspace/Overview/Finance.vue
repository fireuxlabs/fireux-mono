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
      <UPageGrid as="div">
        <UCard>
          <div class="card__header">
            <p>Gross sales</p>
            <UIcon name="i-lucide-banknote" />
          </div>
          <p>
            {{ formatMoney(grossSalesMinor) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Completed checks</p>
            <UIcon name="i-lucide-receipt-text" />
          </div>
          <p>
            {{ formatCount(completedChecks) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Average check</p>
            <UIcon name="i-lucide-calculator" />
          </div>
          <p>
            {{ formatMoney(averageCheckMinor) }}
          </p>
        </UCard>
        <UCard>
          <div class="card__header">
            <p>Items sold</p>
            <UIcon name="i-lucide-utensils" />
          </div>
          <p>
            {{ formatCount(itemsSold) }}
          </p>
        </UCard>
      </UPageGrid>

      <UCard v-if="currencySummary && salesTrend.points.length > 1">
        <FinanceReportTrend :trend="salesTrend" size="lg" />
      </UCard>

      <UCard>
        <div>
          <div>
            <h2>Transaction direction</h2>
            <p>Completed Kitchen sales are the current money-in source.</p>
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
        <p>No Kitchen-owned outgoing source is connected for this view.</p>
      </UCard>

      <div
        v-if="currencySummary"
        class="workspace-surface__grid workspace-surface__grid--2"
      >
        <UCard>
          <template #header>
            <h2>Sales by service</h2>
          </template>
          <ul>
            <li v-for="service in serviceBreakdown" :key="service.type">
              <div>
                <p>
                  {{ formatTransactionType(service.type) }}
                </p>
                <p>{{ formatCount(service.checks) }} checks</p>
              </div>
              <p>
                {{ formatMoney(service.amountMinor) }}
              </p>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2>Best sellers</h2>
          </template>
          <ul>
            <li
              v-for="item in bestSellers"
              :key="`${item.source_item_id}:${item.variant_id ?? ''}`"
            >
              <div>
                <p class="fx-truncate">
                  {{ item.label }}
                </p>
                <p>{{ formatCount(item.quantity) }} sold</p>
              </div>
              <p>
                {{ formatMoney(item.line_gross.amount_minor) }}
              </p>
            </li>
          </ul>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div>
            <div>
              <h2>
                {{
                  isSingleDay ? 'Today’s completed checks' : 'Completed checks'
                }}
              </h2>
              <p>
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

        <FireState v-if="pending" outcome="pending" entity="sales" />

        <div v-else-if="error">
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Could not load the sales report"
            :description="error"
          />
        </div>

        <div v-else-if="currencySummary && filteredTransactions.length === 0">
          <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
          <p>No completed checks for this service</p>
        </div>

        <div v-else-if="!currencySummary">
          <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
          <p>No completed sales</p>
          <p>There is no money-in data for this period.</p>
        </div>

        <div v-else>
          <ul :aria-label="`Completed checks for ${periodLabel}`">
            <li
              v-for="transaction in filteredTransactions"
              :key="transaction.source.id"
            >
              <span>
                <UIcon name="i-lucide-arrow-down-left" aria-hidden="true" />
              </span>
              <div>
                <div class="fx-card__chips">
                  <p class="fx-truncate">
                    {{ transaction.summary }}
                  </p>
                  <UBadge color="success" variant="subtle" size="sm">
                    Completed
                  </UBadge>
                </div>
                <p class="fx-truncate">
                  {{ formatTransactionTime(transaction.occurred_at) }}
                  · {{ formatTransactionType(transaction.order_type) }} ·
                  {{ transaction.closed_by }} ·
                  {{ formatCount(transaction.item_quantity) }} items
                </p>
              </div>
              <p>
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
            <span>
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
        @after:leave="selectedTransaction = null"
      >
        <template #body>
          <div v-if="selectedTransaction" class="workspace-surface">
            <div>
              <div>
                <p>Money in</p>
                <p>
                  {{
                    formatSignedMoney(
                      selectedTransaction.signed_amount.amount_minor
                    )
                  }}
                </p>
              </div>
              <span>
                <UIcon name="i-lucide-arrow-down-left" aria-hidden="true" />
              </span>
            </div>

            <dl>
              <div
                v-for="detail in selectedTransactionDetails"
                :key="detail.label"
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
              <div>
                <h3 id="transaction-items-title">Items</h3>
                <span>
                  {{ formatCount(selectedTransaction.item_quantity) }}
                </span>
              </div>
              <ul>
                <li
                  v-for="(item, index) in selectedTransaction.items"
                  :key="`${item.label}:${index}`"
                >
                  <span> {{ item.quantity }}× </span>
                  <span class="fx-truncate">
                    {{ item.label }}
                  </span>
                  <span>
                    {{ formatMoney(item.line_gross.amount_minor) }}
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </template>

        <template #footer>
          <div>
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
