<template>
  <header>
    <div>
      <img
        v-if="venue.logo_image_url && !logoFailed"
        :src="venue.logo_image_url"
        :alt="`${venue.display_name} logo`"
        class="venue-menu-logo"
        @error="logoFailed = true"
      />
      <div>
        <p>
          {{ venue.display_name }}
        </p>
        <p v-if="venue.short_address || venue.formatted_address">
          {{ venue.short_address || venue.formatted_address }}
        </p>
      </div>
    </div>
    <div>
      <div>
        <h1>
          {{ title || 'Menu' }}
        </h1>
        <p v-if="currencyCode">Prices in {{ currencyCode }}</p>
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
