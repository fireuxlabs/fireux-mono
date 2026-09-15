<template>
  <header v-if="kitchen" class="kitchen-header" data-kitchen-header>
    <div class="flex items-start gap-4 sm:gap-6">
      <div
        class="kitchen-header__logo flex shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        :style="logoStyle"
      >
        <img
          v-if="logoUrl && !logoFailed"
          :src="logoUrl"
          :alt="`${name} logo`"
          class="size-full object-contain p-2"
          @error="logoFailed = true"
        />
        <UIcon
          v-else
          name="i-lucide-utensils"
          class="size-7 text-muted"
          aria-hidden="true"
        />
      </div>
      <div class="min-w-0 space-y-3">
        <h1
          class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl"
        >
          {{ name }}
        </h1>
        <p v-if="kitchen.tagline" class="text-base text-toned sm:text-lg">
          {{ kitchen.tagline }}
        </p>
        <p v-if="address" class="flex items-start gap-2 text-sm text-muted">
          <UIcon
            name="i-lucide-map-pin"
            class="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          {{ address }}
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            v-if="directionsUrl"
            :to="directionsUrl"
            label="Directions"
            icon="i-lucide-navigation"
            color="neutral"
            variant="soft"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Get directions to ${name}`"
          />
          <UButton
            v-if="kitchen.website"
            :to="kitchen.website"
            label="Website"
            icon="i-lucide-arrow-up-right"
            color="neutral"
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Visit the ${name} website`"
          />
        </div>
      </div>
    </div>
    <img
      v-if="kitchen.cover_image && !coverFailed"
      :src="kitchen.cover_image"
      alt=""
      class="kitchen-header__cover rounded-3xl object-cover"
      fetchpriority="high"
      decoding="async"
      @error="coverFailed = true"
    />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response'

const props = defineProps<{ kitchen: KitchenDetailPresentation | null }>()
const logoFailed = ref(false)
const coverFailed = ref(false)
const name = computed(
  () => props.kitchen?.display_name || props.kitchen?.name || 'Kitchen'
)
const logoUrl = computed(
  () => props.kitchen?.logo_image_url || props.kitchen?.wordmark_image || ''
)
const logoStyle = computed(() =>
  logoUrl.value && !logoFailed.value
    ? {
        backgroundColor:
          props.kitchen?.media_backdrop_color || 'var(--ui-bg-elevated)',
      }
    : undefined
)
const address = computed(
  () => props.kitchen?.short_address || props.kitchen?.formatted_address || ''
)
const directionsUrl = computed(
  () =>
    props.kitchen?.google_maps_url ||
    (address.value
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name.value}, ${address.value}`)}`
      : '')
)
watch(logoUrl, () => {
  logoFailed.value = false
})
watch(
  () => props.kitchen?.cover_image,
  () => {
    coverFailed.value = false
  }
)
</script>

<style scoped>
.kitchen-header {
  display: grid;
  align-items: center;
  gap: calc(var(--spacing) * 6);
}
.kitchen-header__logo {
  width: calc(var(--spacing) * 16);
  height: calc(var(--spacing) * 16);
}
.kitchen-header__cover {
  width: 100%;
  height: calc(var(--spacing) * 44);
}
@media (min-width: 64rem) {
  .kitchen-header {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: calc(var(--spacing) * 10);
  }
  .kitchen-header__logo {
    width: calc(var(--spacing) * 24);
    height: calc(var(--spacing) * 24);
  }
  .kitchen-header__cover {
    height: calc(var(--spacing) * 64);
  }
}
</style>
