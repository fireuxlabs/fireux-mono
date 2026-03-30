<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Granite Portfolio Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
            <template v-if="activePortfolio">
              · Active portfolio:
              <span class="font-mono">{{ activePortfolio.id }}</span>
            </template>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            · Portfolio: <span class="font-mono">{{ runtime.id }}</span>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">{{ isOperatorOverview ? scopeLabel : singleOverviewTitle }}</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="isOperatorOverview">
          <template #header>
            <div class="text-sm font-semibold">{{ targetListTitle }}</div>
          </template>

          <div class="space-y-3">
            <div v-if="availablePortfolioPills.length" class="space-y-2">
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

            <p class="text-sm text-dimmed">{{ selectionHelp }}</p>

            <UAlert
              v-if="!hasActivePortfolio"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />
            <UAlert
              v-else-if="activePortfolioPill"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="`${activePortfolioPill.title}${activePortfolioPill.subtitle ? ` · ${activePortfolioPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <UAlert
            v-if="isOperatorOverview && !hasActivePortfolio"
            color="neutral"
            variant="soft"
            :title="quickActionsTitle"
            :description="quickActionsDescription"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in actionLinks"
              :key="link.key"
              :to="link.to"
              variant="soft"
              :icon="link.icon"
              block
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Portfolio Runtime (JSON)"
          context="projects/granite/granite-app · /console/portfolio/overview"
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
import { useRuntimePortfolioConsole } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'
import PortfolioCardsPill from 'fireux-properties/runtime/components/organisms/Portfolio/Cards/Pill.vue'

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
  surfaceLinks,
  overview,
  ownedPortfolios,
  ownedPortfolioPills,
  readOnlyScenarios,
  readOnlyPortfolioPills,
  activePortfolio,
  activePortfolioPill,
  hasActivePortfolio,
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
  quickActionsTitle,
  quickActionsDescription,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'portfolio',
  plural: 'portfolios',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const actionLinks = computed(() => surfaceLinks.value)
const availablePortfolioPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyPortfolioPills.value : ownedPortfolioPills.value
)

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedPortfolios.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String(ownedPortfolios.value[0]?.id || '')),
  singleReadOnlyId: computed(() => String(readOnlyScenarios.value[0]?.id || '')),
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
  overview: overview.value,
  actionLinks: actionLinks.value,
  ownedPortfolios: ownedPortfolios.value,
  readOnlyScenarios: readOnlyScenarios.value,
  isOperatorOverview: isOperatorOverview.value,
  hasActivePortfolio: hasActivePortfolio.value,
}))
</script>
