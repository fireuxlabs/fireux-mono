<template>
  <section class="workspace-surface workspace-surface--compact">
    <UAlert
      v-if="writeError"
      color="error"
      title="Task could not be created"
      :description="writeError"
      ><template #actions><FireCopyError :message="writeError" /></template
    ></UAlert>

    <p v-if="outcome === 'pending'" role="status">Loading compliance…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Could not load compliance"
    >
      <template #actions
        ><FireCopyError message="Could not load compliance."
      /></template>
    </UAlert>
    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Portfolio to view compliance.
    </p>
    <template v-else>
      <UCard>
        <div>
          <div class="fx-inset-panel">
            <div>Total records</div>
            <div>
              {{ complianceSummary.total }}
            </div>
          </div>
          <div class="fx-inset-panel">
            <div>Due soon</div>
            <div>
              {{ complianceSummary.dueSoon }}
            </div>
          </div>
          <div class="fx-inset-panel">
            <div>Overdue</div>
            <div>
              {{ complianceSummary.overdue }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>Compliance board</div>
        </template>

        <div v-if="cards.length" class="fx-card-body-stack">
          <div v-for="item in cards" :key="item.id" class="fx-inset-panel">
            <div class="card__header">
              <div class="fx-card-body-stack">
                <div>{{ item.title }}</div>
                <div>{{ item.subtitle }}</div>
                <div>Expiry: {{ item.expiryDate || 'empty' }}</div>
              </div>

              <div>
                <UBadge :color="statusColor(item.status)" variant="soft">
                  {{ statusLabel(item.status) }}
                </UBadge>
                <UButton
                  v-if="canWrite"
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-list-checks"
                  :disabled="!canWrite || taskBusy"
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
    <FireDiagnosticsDebugPanel
      v-if="isDev"
      title="Portfolio compliance"
      object-origin="fetched"
      :objects="{ records: collection }"
      :derived="{ collectionPath: compliancePath, outcome }"
    />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioWorkspace } from '../../../../../../../fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspace'

import {
  usePortfolioScope,
  usePortfolioChildPath,
} from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import { useTaskCreate } from 'fireux-tasks/runtime/portfolio/composables/tasks/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/portfolio/composables/tasks/useTaskProjection'
import { computed, ref } from 'vue'
import { useTaskScope } from 'fireux-tasks/runtime/portfolio/composables/useTaskScope'
import { usePortfolioComplianceRecordCollection } from '../../../composables/usePortfolioComplianceRecordCollection'
import { useComplianceInterface } from '../../../composables/compliance/useComplianceInterface'
import { ComplianceRecordStorage } from '../../../models/compliance-record.model.ts'

const isDev = import.meta.dev
const runtimePortfolio = usePortfolioScope(usePortfolioWorkspace().id)
const { collection, outcome } =
  usePortfolioComplianceRecordCollection(runtimePortfolio)
const { pill: complianceInterface } = useComplianceInterface()
const { createTask } = useTaskCreate(runtimePortfolio)
const { fromComplianceRecord } = useTaskProjection(runtimePortfolio)
const compliancePath = usePortfolioChildPath(
  runtimePortfolio,
  ComplianceRecordStorage.collection
)

const writeError = ref('')
const taskBusy = ref(false)
const captureScope = useTaskScope(runtimePortfolio, () => {
  writeError.value = ''
  taskBusy.value = false
})
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
  if (!canWrite.value || taskBusy.value) return

  const record = collection.value.find(
    (entry) =>
      String(entry.id || '').trim() === String(complianceId || '').trim()
  )
  if (!record) return

  const draft = fromComplianceRecord(record)
  const isCurrent = captureScope()
  writeError.value = ''
  taskBusy.value = true
  try {
    await createTask(draft)
  } catch (error) {
    if (isCurrent())
      writeError.value = error instanceof Error ? error.message : String(error)
  } finally {
    if (isCurrent()) taskBusy.value = false
  }
}
</script>
