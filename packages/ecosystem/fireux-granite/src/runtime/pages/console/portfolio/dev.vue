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
              <div class="text-xs text-dimmed">Root Path</div>
              <div class="text-sm font-mono">{{ documentCollectionPath }}</div>
            </div>

            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Console Path</div>
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
import { usePortfolioComplianceRecordCollection } from 'fireux-compliance/runtime/composables/fireux/firestore/compliance/fetch/usePortfolioComplianceRecordCollection'
import { usePortfolioDocumentLinkCollection } from 'fireux-documents/runtime/composables/fireux/firestore/documents/fetch/usePortfolioDocumentLinkCollection'
import { useActivePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-console/useActivePortfolio'
import { usePortfolioPropertyCollection } from 'fireux-properties/runtime/composables/fireux/firestore/property/fetch/usePortfolioPropertyCollection'
import { usePortfolioTaskCollection } from 'fireux-tasks/runtime/composables/fireux/firestore/tasks/fetch/usePortfolioTaskCollection'
import { computed } from 'vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-dev',
    label: 'Dev',
    icon: 'i-lucide-braces',
    order: 120,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  name: 'ConsolePortfolioDevPage',
})

const runtimePortfolio = useActivePortfolio()
const { collection: properties } = usePortfolioPropertyCollection(runtimePortfolio)
const { collection: complianceRecords } = usePortfolioComplianceRecordCollection(runtimePortfolio)
const { collection: documentLinks } = usePortfolioDocumentLinkCollection(runtimePortfolio)
const { collection: tasks } = usePortfolioTaskCollection(runtimePortfolio)

const runtimeId = computed(() => String(runtimePortfolio.id.value || '').trim())
const runtimeMode = computed(() => runtimePortfolio.mode.value)
const documentCollectionPath = computed(() => runtimePortfolio.documentCollectionPath.value)
const collectionPath = computed(() => runtimePortfolio.collectionPath.value)
const isReady = computed(() => runtimePortfolio.isReady.value)

const runtimeSnapshot = computed(() => ({
  id: runtimePortfolio.id.value,
  mode: runtimePortfolio.mode.value,
  isDemo: runtimePortfolio.isDemo.value,
  documentCollectionPath: runtimePortfolio.documentCollectionPath.value,
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
