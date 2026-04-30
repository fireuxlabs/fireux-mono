<template>
  <section class="console-surface space-y-4">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Portfolio Properties</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Property views for the selected portfolio will live here.
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
      title="Portfolio properties"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioConsole } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsole'

const {
  selectedPortfolio,
  selectedMode,
  portfolioId,
  rootCollection,
  canWrite,
} = usePortfolioConsole()

const portfolioName = computed(() => String(selectedPortfolio.value?.name ?? '').trim())
const collectionPath = computed(() =>
  rootCollection.value && portfolioId.value
    ? `${rootCollection.value}/${portfolioId.value}/properties`
    : ''
)
const debug = computed(() => ({
  mode: selectedMode.value,
  portfolioId: portfolioId.value,
  rootCollection: rootCollection.value,
  collectionPath: collectionPath.value,
  canWrite: canWrite.value,
  selectedPortfolio: selectedPortfolio.value,
}))
const isDev = import.meta.dev
</script>
