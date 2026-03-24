<template>
  <UDashboardPanel id="console-portfolio-compliance">
    <template #header>
      <LayoutsConsoleNavbar title="Compliance" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /console/portfolio/overview before using compliance monitoring."
          :actions="[{ label: 'Go to portfolios', to: '/console/portfolio/overview', icon: 'i-lucide-arrow-right' }]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-center gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Compliance monitor</div>
                <div class="text-xs text-dimmed">
                  Mode: <span class="font-medium">{{ runtimeMode }}</span>
                  · Source: <code>{{ isReadOnly ? 'read-only scenario' : compliancePath }}</code>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Total records</div>
                <div class="text-xl font-semibold">{{ complianceSummary.total }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Due soon</div>
                <div class="text-xl font-semibold">{{ complianceSummary.dueSoon }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Overdue</div>
                <div class="text-xl font-semibold">{{ complianceSummary.overdue }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Compliance board</div>
            </template>

            <div v-if="cards.length" class="space-y-3">
              <div
                v-for="item in cards"
                :key="item.id"
                class="rounded border border-default p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">{{ item.title }}</div>
                    <div class="text-xs text-dimmed">{{ item.subtitle }}</div>
                    <div class="text-xs text-dimmed">
                      Expiry: {{ item.expiryDate || 'missing' }}
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <UBadge :color="statusColor(item.status)" variant="soft">
                      {{ statusLabel(item.status) }}
                    </UBadge>
                    <UButton
                      v-if="!isReadOnly"
                      size="xs"
                      variant="ghost"
                      icon="i-lucide-list-checks"
                      :disabled="isReadOnly"
                      @click="createTaskFromCompliance(item.id)"
                    >
                      Create task
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No compliance records"
              description="Add compliance records to populate this board."
            />
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import {
  useRuntimePortfolio,
  useRuntimePortfolioPath,
} from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { useTaskCreate } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/mutations/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/utils/projection/useTaskProjection'
import { computed } from 'vue'
import { usePortfolioComplianceRecordCollection } from '../../../composables/fireux/firestore/compliance/fetch/usePortfolioComplianceRecordCollection'
import { useComplianceInterface } from '../../../composables/fireux/firestore/compliance/utils/view/useComplianceInterface'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-compliance'] },
    key: 'console-portfolio-compliance',
    label: 'Compliance',
    icon: 'i-lucide-shield-check',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const { collection } = usePortfolioComplianceRecordCollection(runtimePortfolio)
const { interface: complianceInterface } = useComplianceInterface()
const { createTask } = useTaskCreate(runtimePortfolio)
const { fromComplianceRecord } = useTaskProjection(runtimePortfolio)
const compliancePath = useRuntimePortfolioPath(runtimePortfolio, 'compliance-records')

const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isReadOnly = computed(() => runtimePortfolio.isReadOnly.value)

const cards = computed(() =>
  collection.value
    .map((entry) => complianceInterface(entry))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
)

const complianceSummary = computed(() => {
  const totals = {
    total: cards.value.length,
    dueSoon: 0,
    overdue: 0,
  }

  for (const item of cards.value) {
    if (item.status === 'dueSoon') totals.dueSoon += 1
    if (item.status === 'overdue') totals.overdue += 1
  }

  return totals
})

const statusLabel = (status: 'ok' | 'dueSoon' | 'overdue' | null) => {
  if (status === 'ok') return 'ok'
  if (status === 'dueSoon') return 'due soon'
  if (status === 'overdue') return 'overdue'
  return 'missing expiry'
}

const statusColor = (status: 'ok' | 'dueSoon' | 'overdue' | null) => {
  if (status === 'ok') return 'success'
  if (status === 'dueSoon') return 'warning'
  if (status === 'overdue') return 'error'
  return 'neutral'
}

const createTaskFromCompliance = async (complianceId: string) => {
  if (isReadOnly.value) return

  const record = collection.value.find((entry) => String(entry.id || '').trim() === String(complianceId || '').trim())
  if (!record) return

  const draft = fromComplianceRecord(record)
  await createTask(draft)
}
</script>
