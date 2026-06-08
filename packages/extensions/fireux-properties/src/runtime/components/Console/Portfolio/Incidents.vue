<template>
  <section class="console-surface space-y-4">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Portfolio Incidents</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Incident views for the selected portfolio will live here.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Portfolio:
            <span class="console-summary-value">{{ portfolioName || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Mode:
            <span class="console-summary-value">{{ selectedMode }}</span>
          </div>
          <div class="console-summary-field">
            Source:
            <span class="console-summary-value">{{ collectionPath || 'Unavailable' }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Portfolio incidents"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../../composables/fireux/console/portfolio/operations/useActivePortfolio'

const runtimePortfolio = useActivePortfolio()
const selectedPortfolio = runtimePortfolio.entity
const selectedMode = runtimePortfolio.mode
const portfolioId = runtimePortfolio.id
const rootCollection = runtimePortfolio.rootCollection
const canWrite = runtimePortfolio.canWrite

const portfolioName = computed(() =>
  String(selectedPortfolio.value?.name ?? '').trim()
)
const collectionPath = usePortfolioConsoleChildPath(runtimePortfolio, 'incidents')
const debug = computed(() => ({
  mode: selectedMode.value,
  portfolioId: portfolioId.value,
  consoleAppId: runtimePortfolio.consoleAppId.value,
  rootCollection: rootCollection.value,
  portfolioCollectionPath: runtimePortfolio.collectionPath.value,
  collectionPath: collectionPath.value,
  canWrite: canWrite.value,
  selectedPortfolio: selectedPortfolio.value,
}))
const isDev = import.meta.dev
</script>
