<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Identity</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Root-facing portfolio information for the selected portfolio.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Name:
            <span class="console-summary-value">{{ name || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Notes:
            <span class="console-summary-value">{{ notes || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Owner:
            <span class="console-summary-value">{{ ownerLabel || 'Unset' }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Portfolio identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIdentity } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleIdentity'

const { name, notes, ownerLabel, debug } = usePortfolioConsoleIdentity()
const isDev = import.meta.dev
</script>
