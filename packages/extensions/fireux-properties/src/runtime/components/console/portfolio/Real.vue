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
import { computed } from 'vue'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioSelection } from '../../../composables/fireux/app/portfolio-console/usePortfolioSelection'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime } = usePortfolioConsole()
const portfolioSelection = usePortfolioSelection()
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: livePortfolios } = usePortfolioCollection()

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
    imageUrl: normalizeString(imageUrl) || pill.avatarUrl,
  }
}

const livePortfolioPills = computed(() =>
  livePortfolios.value
    .map((entry) => buildPortfolioPill(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

const activePortfolioPill = computed(
  () =>
    livePortfolioPills.value.find((item) => item.id === runtime.id.value) ??
    buildPortfolioPill(runtime.portfolio.value as Portfolio | null)
)

const selectPortfolio = (portfolioId: string) => {
  const resolvedId = normalizeString(portfolioId)
  if (!resolvedId) return
  portfolioSelection.setRuntimePortfolio({
    portfolioId: resolvedId,
    mode: 'live',
  })
}
</script>
