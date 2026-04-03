<template>
  <UDashboardPanel id="console-portfolio-home">
    <template #header>
      <LayoutsConsoleNavbar title="Portfolio Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activePortfolioPill"
          color="primary"
          variant="soft"
          :title="activePortfolioPill.title"
          :description="activePortfolioPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo portfolio"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo portfolios"
        />

        <div v-if="showSelector" class="space-y-2">
          <PortfolioCardsPill
            v-for="item in portfolioPills"
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
import { useState } from '#imports'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { computed, onScopeDispose, watchEffect } from 'vue'
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

type ConsoleHeaderPill = {
  component: string
  props: Record<string, unknown>
}

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios, setActivePortfolio } = useRuntimePortfolioConsole()
const { pill: toPortfolioCard } = usePortfolioInterface()

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & {
  imageUrl?: string
}

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

const portfolioPills = computed(() =>
  scenarios.value
    .map((entry) => buildPortfolioPill(entry.portfolio as Portfolio, entry.manager.avatar_url))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const activePortfolioPill = computed(() =>
  portfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(
    runtime.portfolio.value as Portfolio | null,
    runtime.scenario.value?.manager.avatar_url
  )
)

const showSelector = computed(() => scenarios.value.length > 1)
const portfolioHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-portfolio',
  () => null
)

watchEffect(() => {
  const pill = activePortfolioPill.value

  portfolioHeaderPill.value = pill
    ? {
        component: 'PortfolioCardsPill',
        props: {
          ...pill,
          link: false,
          showBadges: false,
        },
      }
    : null
})

onScopeDispose(() => {
  portfolioHeaderPill.value = null
})

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    const scenarioId = String(scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActivePortfolio(scenarioId)
  })
}

const selectPortfolio = (portfolioId: string) => {
  setActivePortfolio(portfolioId)
}
</script>
