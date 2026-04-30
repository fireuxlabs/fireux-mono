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
          Root-facing kitchen information for the selected kitchen.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Name:
            <span class="console-summary-value">{{ name || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Place ID:
            <span class="console-summary-value">{{ placeId || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Address:
            <span class="console-summary-value">{{ address || 'Unset' }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'

const { name, placeId, address, debug } = useKitchenConsoleIdentity()
const isDev = import.meta.dev
</script>
