<template>
  <section class="space-y-6">
    <UAlert
      v-if="!portfolios.length"
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
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a portfolio below to load it into the console.
        </p>
      </div>

      <PortfolioCollectionManager
        :collection="portfolios"
        title="Choose Portfolio"
        description="Select the live portfolio you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectPortfolio"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioCollection } from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioSelection } from '../../../composables/fireux/app/portfolio-console/usePortfolioSelection'
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'

const { portfolio } = usePortfolioConsole()
const { setRuntimePortfolio } = usePortfolioSelection()
const { collection: portfolios } = usePortfolioCollection()

const selectPortfolio = (portfolioId: string) => {
  setRuntimePortfolio({ portfolioId })
}
</script>
