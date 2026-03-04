<template>
  <UDashboardPanel id="console-portfolio-dev">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Runtime Dev" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UCard>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Runtime ID</div>
              <div class="text-sm font-mono break-all">{{ runtimeId || 'unset' }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Mode</div>
              <div class="text-sm font-medium">{{ runtimeMode }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Collection Path</div>
              <div class="text-sm font-mono">{{ collectionPath }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Ready</div>
              <div class="text-sm font-medium">{{ isReady ? 'yes' : 'no' }}</div>
            </div>
          </div>
        </UCard>

        <DevJson
          title="Portfolio Runtime (JSON)"
          context="console/portfolio/dev · current runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="true"
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
import { useDocumentLinkCollection } from 'fireux-documents/runtime/composables/fireux/firestore/documents/fetch/useDocumentLinkCollection'
import { useTaskCollection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/fetch/useTaskCollection'

definePageMeta({
  layout: 'granite-console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-dev',
    label: 'Dev',
    icon: 'i-lucide-braces',
    order: 120,
    desktop: true,
    mobile: true,
    layouts: ['granite-console'],
  },
  requiresAuth: true,
  name: 'ConsolePortfolioDevPage',
})

const runtimePortfolio = useRuntimePortfolio()
const { collection: properties } = usePropertyCollection(runtimePortfolio)
const { collection: complianceRecords } = useComplianceRecordCollection(runtimePortfolio)
const { collection: documentLinks } = useDocumentLinkCollection(runtimePortfolio)
const { collection: tasks } = useTaskCollection(runtimePortfolio)

const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const collectionPath = computed(() => runtimePortfolio.collectionPath.value)
const isReady = computed(() => runtimePortfolio.isReady.value)

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
  counts: {
    properties: properties.value.length,
    complianceRecords: complianceRecords.value.length,
    documentLinks: documentLinks.value.length,
    tasks: tasks.value.length,
    transactions: runtimePortfolio.scenario.value?.transactions?.length ?? 0,
  },
}))
</script>
