<template>
  <section class="console-surface space-y-4">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Focus</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          {{ description }}
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Kitchen:
            <span class="console-summary-value">{{ selectedKitchenName }}</span>
          </div>
          <div class="console-summary-field">
            Mode:
            <span class="console-summary-value">{{ selectedModeLabel }}</span>
          </div>
          <div class="console-summary-field">
            {{ itemLabel }}:
            <span class="console-summary-value">{{ itemCount }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      :title="pendingTitle"
      :description="pendingDescription"
    />

    <slot v-else />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleChildFocus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleChildFocus'

const props = withDefaults(
  defineProps<{
    description: string
    itemCount?: string | number
    itemLabel?: string
    pending?: boolean
    pendingTitle?: string
    pendingDescription?: string
  }>(),
  {
    itemCount: '0',
    itemLabel: 'Items',
    pending: false,
    pendingTitle: 'Loading',
    pendingDescription: 'Fetching collection data for the selected kitchen.',
  }
)

const { selectedKitchenName, selectedModeLabel } = useKitchenConsoleChildFocus()
</script>
