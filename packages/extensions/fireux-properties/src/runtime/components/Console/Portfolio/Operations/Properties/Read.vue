<template>
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
          Source:
          <span class="console-summary-value">{{ collectionPath || 'Unavailable' }}</span>
        </div>
      </div>
    </div>
  </UCard>

  <DevDebugPanel
    title="Portfolio properties"
    scope="console"
      object-origin="fetched"
      :objects="{ properties }"
      :derived="debug"
  />
</template>

<script setup lang="ts">
import { usePortfolioConsoleProperties } from '../../../../../composables/fireux/console/portfolio/operations/Properties/usePortfolioConsoleProperties'

const {
  properties,
  portfolioName,
  collectionPath,
  debug,
} = usePortfolioConsoleProperties()
</script>
