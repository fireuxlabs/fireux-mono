<template>
  <header class="venue-menu-header">
    <div class="venue-menu-header__identity">
      <img
        v-if="venue.logo_image_url && !logoFailed"
        :src="venue.logo_image_url"
        :alt="`${venue.display_name} logo`"
        class="venue-menu-logo"
        :style="{ backgroundColor: venue.media_backdrop_color || undefined }"
        @error="logoFailed = true"
      />
      <div class="venue-menu-header__venue">
        <p class="venue-menu-header__name">
          {{ venue.display_name }}
        </p>
        <p
          v-if="venue.short_address || venue.formatted_address"
          class="venue-menu-header__address"
        >
          {{ venue.short_address || venue.formatted_address }}
        </p>
      </div>
    </div>
    <UPageHeader
      :title="title || 'Menu'"
      :description="currencyCode ? `Prices in ${currencyCode}` : undefined"
      class="venue-menu-header__heading"
    >
      <template #links>
        <UButton
          :to="venuePath"
          label="Venue information"
          icon="i-lucide-info"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UPageHeader>
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
.venue-menu-header {
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding-block-end: calc(var(--spacing) * 6);
  border-bottom: 1px solid var(--ui-border);
  min-width: 0;
}
.venue-menu-header__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}
.venue-menu-header__venue {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
  overflow-wrap: anywhere;
}
.venue-menu-header__name {
  font-size: var(--text-lg);
  font-weight: 600;
}
.venue-menu-header__address {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
.venue-menu-header__heading {
  padding-block: 0;
  border: 0;
}
.venue-menu-logo {
  width: 5rem;
  height: 5rem;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: var(--ui-radius);
  padding: calc(var(--spacing) * 2);
  background: white;
}
</style>
