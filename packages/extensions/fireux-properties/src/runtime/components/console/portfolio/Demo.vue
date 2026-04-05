<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activePortfolioPill)"
      :has-options="demoPortfolioPills.length > 0"
      select-title="Select a demo portfolio"
      empty-title="No demo portfolios"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activePortfolioPill?.title || ''"
          :description="activePortfolioPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="demoPortfolioPills.length" class="space-y-2">
      <PortfolioCardsPill
        v-for="item in demoPortfolioPills"
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

<script setup lang="ts">
import { useState } from '#imports'
import { computed, watchEffect } from 'vue'
import type { Portfolio } from '../../../models/portfolio.model'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimePortfolioConsole()
const portfolioSelection = useRuntimePortfolioSelection()
const { pill: toPortfolioCard } = usePortfolioInterface()

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & { imageUrl?: string }

const buildPortfolioPill = (
  target?: Portfolio | null,
  imageUrl?: unknown
): PortfolioPill | null => {
  const pill = toPortfolioCard(target as Portfolio | null)
  if (!pill) return null
  return {
    ...pill,
    imageUrl: normalizeString(imageUrl) || pill.avatarUrl,
  }
}

const demoPortfolioPills = computed(() =>
  scenarios.value
    .map((entry) => buildPortfolioPill(entry.portfolio as Portfolio, entry.manager.avatar_url))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const activePortfolioPill = computed(() =>
  demoPortfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(
    runtime.portfolio.value as Portfolio | null,
    runtime.scenario.value?.manager.avatar_url
  )
)

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activePortfolioPill.value
    ? {
        component: 'PortfolioCardsPill',
        props: {
          ...activePortfolioPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})

const selectPortfolio = (portfolioId: string) => {
  const resolvedId = normalizeString(portfolioId)
  if (!resolvedId) return
  portfolioSelection.setRuntimePortfolio({
    portfolioId: resolvedId,
    mode: 'demo',
  })
}
</script>
