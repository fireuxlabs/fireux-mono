<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-toned">
            Mode
          </span>

          <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/60 p-1">
            <UButton
              v-for="option in modeOptions"
              :key="option.value"
              size="xs"
              :color="selectedMode === option.value ? 'primary' : 'neutral'"
              :variant="selectedMode === option.value ? 'solid' : 'ghost'"
              :aria-pressed="selectedMode === option.value"
              @click="selectMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="activePortfolioPill"
          color="primary"
          variant="soft"
          :title="activePortfolioPill.title"
          :description="activePortfolioPill.subtitle || ''"
        />

        <UAlert
          v-else-if="availablePortfolioPills.length"
          color="neutral"
          variant="soft"
          :title="selectTitle"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          :title="emptyTitle"
        />

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
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useConsoleHeaderPill } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleHeaderPill'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { computed, watchEffect } from 'vue'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio',
    label: 'Portfolio',
    icon: 'i-lucide-layout-dashboard',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const modeOptions = [
  { value: 'read-only', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimePortfolioConsole()
const portfolioSelection = useRuntimePortfolioSelection()
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: livePortfolios } = usePortfolioCollection()
const { collection: testPortfolios } = usePortfolioCollection({ collectionPath: 'test-portfolios' })

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & {
  imageUrl?: string
}
type ConsoleMode = (typeof modeOptions)[number]['value']

const buildPortfolioPill = (
  target?: Portfolio | null,
  imageUrl?: unknown
): PortfolioPill | null => {
  const pill = toPortfolioCard(target as Portfolio | null)
  if (!pill) return null

  return {
    ...pill,
    imageUrl: pill.avatarUrl || normalizeString(imageUrl),
  }
}

const demoPortfolioPills = computed(() =>
  scenarios.value
    .map((entry) => buildPortfolioPill(entry.portfolio as Portfolio, entry.manager.avatar_url))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const livePortfolioPills = computed(() =>
  livePortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const testPortfolioPills = computed(() =>
  testPortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const selectedMode = portfolioSelection.mode
const availablePortfolioPills = computed(() => {
  if (selectedMode.value === 'live') return livePortfolioPills.value
  if (selectedMode.value === 'test') return testPortfolioPills.value
  return demoPortfolioPills.value
})

const activePortfolioPill = computed(() =>
  availablePortfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(
    runtime.portfolio.value as Portfolio | null,
    runtime.scenario.value?.manager.avatar_url
  )
)
const selectTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Select a real portfolio'
  if (selectedMode.value === 'test') return 'Select a test portfolio'
  return 'Select a demo portfolio'
})
const emptyTitle = computed(() => {
  if (selectedMode.value === 'live') return 'No real portfolios'
  if (selectedMode.value === 'test') return 'No test portfolios'
  return 'No demo portfolios'
})

useConsoleHeaderPill(
  'console-header-pill-portfolio',
  'PortfolioCardsPill',
  activePortfolioPill
)

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (availablePortfolioPills.value.length !== 1) return
    selectPortfolio(String(availablePortfolioPills.value[0]?.id || ''))
  })
}

const selectPortfolio = (portfolioId: string, openOverview = true) => {
  const resolvedId = normalizeString(portfolioId)
  if (!resolvedId) return
  portfolioSelection.setRuntimePortfolio({
    portfolioId: resolvedId,
    mode: selectedMode.value,
  })
  if (openOverview) void navigateTo('/console/portfolio/overview')
}

const selectMode = (mode: ConsoleMode) => {
  portfolioSelection.setRuntimePortfolio({
    selectedId: '',
    mode,
  })
}

const clearSelection = () => {
  portfolioSelection.setRuntimePortfolio({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
