<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            <template v-if="runtime.id">
              · Active portfolio:
              <span class="font-mono">{{ runtime.id }}</span>
            </template>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ isOperatorOverview ? targetListTitle : singleOverviewTitle }}
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-dimmed">{{ selectionHelpText }}</p>

            <div v-if="showSelector && availablePortfolioPills.length" class="space-y-2">
              <PortfolioCardsPill
                v-for="item in availablePortfolioPills"
                :key="item.id"
                v-bind="item"
                :link="false"
                :action="true"
                :show-badges="false"
                class="cursor-pointer"
                @action="selectPortfolio(item.id)"
              />
            </div>

            <UAlert
              v-if="isOperatorOverview && !hasActivePortfolio"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />

            <UAlert
              v-else-if="activeSelectionDescription"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="activeSelectionDescription"
            />
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Portfolio Runtime (JSON)"
          context="console/portfolio/overview · runtime snapshot"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useConsoleOverviewLabels } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewLabels'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'
import PortfolioCardsPill from '../../../components/organisms/Portfolio/Cards/Pill.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-overview',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  ownedPortfolios,
  ownedPortfolioPills,
  readOnlyScenarios,
  readOnlyPortfolioPills,
  activePortfolioPill,
  hasActivePortfolio,
  canSelectMultipleLive,
  showSelector,
  isOperatorOverview,
  ownershipPending,
  setActiveOwnedPortfolio,
} = useRuntimePortfolioConsole()

const {
  scopeLabel,
  targetListTitle,
  selectionTitle,
  selectionDescription,
  selectionHelp,
  activeSelectionTitle,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'portfolio',
  plural: 'portfolios',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const availablePortfolioPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyPortfolioPills.value : ownedPortfolioPills.value
)
const selectionHelpText = computed(() => {
  if (isOperatorOverview.value) return selectionHelp.value
  if (showSelector.value) {
    return 'This console is scoped to one active portfolio. Switch the active portfolio here any time.'
  }
  return 'This console is running as a single-portfolio workspace.'
})
const activeSelectionDescription = computed(() => {
  if (activePortfolioPill.value) {
    return `${activePortfolioPill.value.title}${
      activePortfolioPill.value.subtitle ? ` · ${activePortfolioPill.value.subtitle}` : ''
    }`
  }
  return String(runtime.id.value || '').trim()
})

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedPortfolios.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String(ownedPortfolios.value[0]?.id || '')),
  singleReadOnlyId: computed(() => String(readOnlyScenarios.value[0]?.id || '')),
  allowMultiLiveSelection: canSelectMultipleLive,
  setActiveTarget: setActiveOwnedPortfolio,
  createPath: '/console/portfolio/create',
  overviewPath: '/console/portfolio/overview',
})

await ensureOverviewEntry()

const selectPortfolio = (portfolioId: string) => {
  setActiveOwnedPortfolio(portfolioId)
}

const runtimeSnapshot = computed(() => ({
  id: runtime.id.value,
  mode: runtime.mode.value,
  isReadOnly: runtime.isReadOnly.value,
  documentCollectionPath: runtime.documentCollectionPath.value,
  collectionPath: runtime.collectionPath.value,
  pending: runtime.pending.value,
  isLoading: runtime.isLoading.value,
  isReady: runtime.isReady.value,
  doc: runtime.doc.value,
  data: runtime.data.value,
  ownedPortfolios: ownedPortfolios.value,
  readOnlyScenarios: readOnlyScenarios.value,
  canSelectMultipleLive: canSelectMultipleLive.value,
  showSelector: showSelector.value,
  isOperatorOverview: isOperatorOverview.value,
  hasActivePortfolio: hasActivePortfolio.value,
}))
</script>
