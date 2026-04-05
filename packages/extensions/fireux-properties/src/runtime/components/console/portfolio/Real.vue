<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activePortfolioPill)"
      :has-options="livePortfolioPills.length > 0"
      select-title="Select a real portfolio"
      empty-title="No real portfolios"
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

    <div v-if="livePortfolioPills.length" class="space-y-2">
      <PortfolioCardsPill
        v-for="item in livePortfolioPills"
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
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { useRuntimePortfolioSelection } from '../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { useRuntimePortfolioConsole } from '../../../composables/fireux/app/portfolio-runtime/useRuntimePortfolioConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime } = useRuntimePortfolioConsole()
const portfolioSelection = useRuntimePortfolioSelection()
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: livePortfolios } = usePortfolioCollection()

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

const livePortfolioPills = computed(() =>
  livePortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const activePortfolioPill = computed(() =>
  livePortfolioPills.value.find((item) => item.id === runtime.id.value) ??
  buildPortfolioPill(runtime.portfolio.value as Portfolio | null)
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
    mode: 'live',
  })
}
</script>
