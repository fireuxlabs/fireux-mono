<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: gate compliance actions with Portfolio write authority. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-portfolio-compliance">
      <template #header>
        <LayoutsConsoleNavbar title="Compliance" />
      </template>

      <template #body>
        <section class="space-y-6">
          <UCard>
            <div class="flex items-center gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Compliance monitor</div>
                <div class="text-xs text-dimmed">
                  Mode: <span class="font-medium">{{ runtimeMode }}</span> ·
                  Source:
                  <code>{{ isDemo ? 'demo scenario' : compliancePath }}</code>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Total records</div>
                <div class="text-xl font-semibold">
                  {{ complianceSummary.total }}
                </div>
              </div>
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Due soon</div>
                <div class="text-xl font-semibold">
                  {{ complianceSummary.dueSoon }}
                </div>
              </div>
              <div class="fx-inset-panel">
                <div class="text-xs text-dimmed">Overdue</div>
                <div class="text-xl font-semibold">
                  {{ complianceSummary.overdue }}
                </div>
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
                class="fx-inset-panel"
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
                      v-if="canWrite"
                      size="xs"
                      variant="ghost"
                      icon="i-lucide-list-checks"
                      :disabled="!canWrite"
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
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/portfolio/composables/console/operations/useActivePortfolio'
import { useTaskCreate } from 'fireux-tasks/runtime/portfolio/composables/console/operations/Tasks/mutations/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/portfolio/composables/console/operations/Tasks/utils/projection/useTaskProjection'
import { computed } from 'vue'
import { usePortfolioComplianceRecordCollection } from '../../../portfolio/composables/console/operations/Compliance/fetch/usePortfolioComplianceRecordCollection'
import { useComplianceInterface } from '../../../portfolio/composables/console/operations/Compliance/utils/view/useComplianceInterface'
import { ComplianceRecordStorage } from '../../../portfolio/models/compliance-record.model.ts'

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-compliance'] },
  nav: {
    key: 'console-portfolio-compliance',
    label: 'Compliance',
    icon: 'i-lucide-shield-check',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

const runtimePortfolio = useActivePortfolio()
const { collection } = usePortfolioComplianceRecordCollection(runtimePortfolio)
const { pill: complianceInterface } = useComplianceInterface()
const { createTask } = useTaskCreate(runtimePortfolio)
const { fromComplianceRecord } = useTaskProjection(runtimePortfolio)
const compliancePath = usePortfolioConsoleChildPath(
  runtimePortfolio,
  ComplianceRecordStorage.collection
)

const runtimeMode = computed(() => runtimePortfolio.mode.value)
const isDemo = computed(() => runtimePortfolio.isDemo.value)
const canWrite = computed(() => runtimePortfolio.canWrite.value)

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
  if (!canWrite.value) return

  const record = collection.value.find(
    (entry) =>
      String(entry.id || '').trim() === String(complianceId || '').trim()
  )
  if (!record) return

  const draft = fromComplianceRecord(record)
  await createTask(draft)
}
</script>
