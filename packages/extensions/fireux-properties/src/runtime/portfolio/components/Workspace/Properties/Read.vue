<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Portfolio Properties</div>
      </div>
    </template>

    <div class="space-y-3">
      <p class="workspace-card-header__description">
        Property views for the selected portfolio will live here.
      </p>

      <div class="workspace-summary-grid">
        <div class="workspace-summary-field">
          Portfolio:
          <span class="workspace-summary-value">{{
            portfolioName || 'Unset'
          }}</span>
        </div>
        <div class="workspace-summary-field">
          Source:
          <span class="workspace-summary-value">{{
            collectionPath || 'Unavailable'
          }}</span>
        </div>
      </div>
    </div>
  </UCard>

  <DevDebugPanel
    title="Portfolio properties"
    scope="workspace"
    object-origin="fetched"
    :objects="{ properties }"
    :derived="debug"
  />
</template>

<script setup lang="ts">
import { usePortfolioWorkspaceProperties } from '../../../composables/workspace/operations/Properties/usePortfolioWorkspaceProperties'

const { properties, portfolioName, collectionPath, debug } =
  usePortfolioWorkspaceProperties()
</script>
