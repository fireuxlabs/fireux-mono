<template>
  <header class="space-y-5 border-b border-default pb-6">
    <div class="flex items-center gap-4">
      <img
        v-if="venue.logo_image_url && !logoFailed"
        :src="venue.logo_image_url"
        :alt="`${venue.display_name} logo`"
        class="venue-menu-logo"
        @error="logoFailed = true"
      />
      <div class="min-w-0">
        <p class="text-xl font-semibold text-highlighted">
          {{ venue.display_name }}
        </p>
        <p
          v-if="venue.short_address || venue.formatted_address"
          class="mt-1 text-sm text-muted"
        >
          {{ venue.short_address || venue.formatted_address }}
        </p>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-tight">
          {{ title || 'Menu' }}
        </h1>
        <p v-if="currencyCode" class="text-sm text-muted">
          Prices in {{ currencyCode }}
        </p>
      </div>
      <UButton
        :to="venuePath"
        label="Venue information"
        icon="i-lucide-info"
        color="neutral"
        variant="ghost"
      />
    </div>
  </header>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response'
const props = defineProps<{
  venue: KitchenDetailPresentation
  title?: string
  currencyCode?: string
  venuePath: string
}>()
const logoFailed = ref(false)
watch(
  () => props.venue.logo_image_url,
  () => {
    logoFailed.value = false
  }
)
</script>

<style scoped>
.venue-menu-logo {
  width: 5rem;
  height: 5rem;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: var(--ui-radius);
}
</style>
