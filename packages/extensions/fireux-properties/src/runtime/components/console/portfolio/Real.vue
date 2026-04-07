<template>
  <section class="space-y-6">
    <UAlert
      v-if="!portfolioCards.length"
      color="neutral"
      variant="soft"
      title="No live portfolios found"
      description="No live portfolios are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Selected Portfolio</div>

        <PortfolioCardsPill
          v-if="portfolio"
          v-bind="portfolio"
          :link="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a portfolio below to load it into the console.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Choose Portfolio</div>
            <p class="text-sm text-dimmed">
              Select the live portfolio you want to work on.
            </p>
          </div>
        </template>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <UButton
            v-for="entry in portfolioCards"
            :key="entry.id"
            color="neutral"
            :variant="entry.id === selectedId ? 'solid' : 'soft'"
            class="justify-start"
            @click="selectPortfolio(entry.id)"
          >
            <span class="truncate">{{ entry.title }}</span>
          </UButton>
        </div>
      </UCard>
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

const { portfolio } = usePortfolioConsole()
const { selectedId, setRuntimePortfolio } = usePortfolioSelection()
const { pill: toPortfolioCard } = usePortfolioInterface()
const { collection: livePortfolios } = usePortfolioCollection()

const portfolioCards = computed(() =>
  livePortfolios.value
    .map((entry) => toPortfolioCard(entry as Portfolio))
    .filter((entry): entry is PortfolioPill => Boolean(entry))
)

type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>>

const selectPortfolio = (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId })
}
</script>
