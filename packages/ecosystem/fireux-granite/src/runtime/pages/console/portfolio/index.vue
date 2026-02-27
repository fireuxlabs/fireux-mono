<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtimeId"
          color="warning"
          variant="soft"
          title="No portfolio selected"
          description="Select a portfolio on /portfolios before entering Granite console tools."
          :actions="[{ label: 'Go to portfolios', to: '/portfolios', icon: 'i-lucide-arrow-right' }]"
        />

        <template v-else>
          <UCard>
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Current portfolio context</div>
                <div class="text-xs text-dimmed">
                  ID: <span class="font-mono">{{ runtimeId }}</span>
                  · mode: <span class="font-medium">{{ runtimeMode }}</span>
                </div>
              </div>

              <UButton to="/portfolios" size="sm" variant="soft" icon="i-lucide-repeat">
                Change selection
              </UButton>
            </div>
          </UCard>

          <UCard>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Properties</div>
                <div class="text-xl font-semibold">{{ metrics.properties }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Compliance alerts</div>
                <div class="text-xl font-semibold">{{ metrics.complianceAlerts }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Document links</div>
                <div class="text-xl font-semibold">{{ metrics.documentLinks }}</div>
              </div>
              <div class="rounded border border-default p-3">
                <div class="text-xs text-dimmed">Open tasks</div>
                <div class="text-xl font-semibold">{{ metrics.openTasks }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Granite tools</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <UButton to="/console/portfolio/properties" variant="soft" icon="i-lucide-building" block>
                Properties
              </UButton>
              <UButton to="/console/portfolio/compliance" variant="soft" icon="i-lucide-shield-check" block>
                Compliance
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

definePageMeta({
  layout: 'granite-console',
  nav: {
    key: 'console-portfolio-home',
    label: 'Overview',
    icon: 'i-lucide-terminal',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
    group: 'granite',
  },
  requiresAuth: true,
})

const runtimePortfolio = useRuntimePortfolio()
const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)

const { collection: properties } = usePropertyCollection(runtimePortfolio)
const { collection: complianceRecords } = useComplianceRecordCollection(runtimePortfolio)
const { collection: documentLinks } = useDocumentLinkCollection(runtimePortfolio)
const { collection: tasks } = useTaskCollection(runtimePortfolio)

const metrics = computed(() => {
  const complianceAlerts = complianceRecords.value.filter((record) => {
    const status = deriveComplianceStatus(record.expiry_date, { dueSoonDays: 30 })
    return status === 'dueSoon' || status === 'overdue'
  }).length

  const openTasks = tasks.value.filter((task) => task.status !== 'done').length

  return {
    properties: properties.value.length,
    complianceAlerts,
    documentLinks: documentLinks.value.length,
    openTasks,
  }
})
</script>
