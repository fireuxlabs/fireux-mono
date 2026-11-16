<template>
  <header
    class="venue-menu-header"
    :class="{ 'venue-menu-header--prominent': prominent }"
  >
    <figure
      v-if="prominent && coverUrl && !coverFailed"
      class="venue-menu-header__cover"
    >
      <img
        :src="coverUrl"
        :alt="`${venue.display_name} cover photo`"
        fetchpriority="high"
        decoding="async"
        @error="coverFailed = true"
      />
    </figure>
    <div class="venue-menu-header__content">
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
    </div>
  </header>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenDetailPresentation } from '../../types/public'
const props = defineProps<{
  venue: KitchenDetailPresentation
  title?: string
  currencyCode?: string
  venuePath: string
  prominent?: boolean
}>()
const logoFailed = ref(false)
const coverFailed = ref(false)
const coverUrl = computed(() => props.venue.cover_image || '')
watch(coverUrl, () => {
  coverFailed.value = false
})
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
.venue-menu-header__content {
  display: grid;
  gap: calc(var(--spacing) * 6);
  min-width: 0;
}
.venue-menu-header--prominent {
  overflow: hidden;
  padding: 0;
  gap: 0;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg);
}
.venue-menu-header--prominent .venue-menu-header__content {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}
.venue-menu-header__cover {
  width: 100%;
  aspect-ratio: 21 / 8;
  max-height: 22rem;
  overflow: hidden;
  background: var(--ui-bg-elevated);
}
.venue-menu-header__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 40rem) {
  .venue-menu-header__cover {
    aspect-ratio: 16 / 9;
  }
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
