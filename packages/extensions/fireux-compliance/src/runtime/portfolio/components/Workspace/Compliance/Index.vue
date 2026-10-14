<template>
  <section class="space-y-6">
    <UAlert
      v-if="writeError"
      color="error"
      title="Task could not be created"
      :description="writeError"
      ><template #actions><MoleculesCopyError :message="writeError" /></template
    ></UAlert>

    <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">
      Loading compliance…
    </p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Could not load compliance"
    >
      <template #actions
        ><MoleculesCopyError message="Could not load compliance."
      /></template>
    </UAlert>
    <p
      v-else-if="outcome !== 'ready' && outcome !== 'empty'"
      class="text-sm text-muted"
    >
      Select an available Portfolio to view compliance.
    </p>
    <template v-else>
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
          <div v-for="item in cards" :key="item.id" class="fx-inset-panel">
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
    <DiagnosticsDebugPanel
      v-if="isDev"
      title="Portfolio compliance"
      object-origin="fetched"
      :objects="{ records: collection }"
      :derived="{ collectionPath: compliancePath, outcome }"
    />
  </section>
</template>

<script setup lang="ts">
import {
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { useTaskCreate } from 'fireux-tasks/runtime/portfolio/composables/tasks/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/portfolio/composables/tasks/useTaskProjection'
import { computed, ref } from 'vue'
import { useTaskScope } from 'fireux-tasks/runtime/portfolio/composables/useTaskScope'
import { usePortfolioComplianceRecordCollection } from '../../../composables/usePortfolioComplianceRecordCollection'
import { useComplianceInterface } from '../../../composables/compliance/useComplianceInterface'
import { ComplianceRecordStorage } from '../../../models/compliance-record.model.ts'

const isDev = import.meta.dev
const runtimePortfolio = useActivePortfolio()
const { collection, outcome } =
  usePortfolioComplianceRecordCollection(runtimePortfolio)
const { pill: complianceInterface } = useComplianceInterface()
const { createTask } = useTaskCreate(runtimePortfolio)
const { fromComplianceRecord } = useTaskProjection(runtimePortfolio)
const compliancePath = usePortfolioWorkspaceChildPath(
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
