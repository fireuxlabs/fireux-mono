<template>
  <section
    v-if="links.length"
    id="contact"
    class="grid scroll-mt-24 gap-4"
    aria-labelledby="venue-contact-heading"
  >
    <h2
      id="venue-contact-heading"
      class="text-2xl font-semibold tracking-tight text-highlighted"
    >
      Contact
    </h2>
    <div class="flex flex-wrap gap-3">
      <UButton
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        :icon="link.icon"
        :label="link.value"
        :aria-label="`${link.label}: ${place.name || 'venue'}`"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
        color="neutral"
        variant="soft"
        :ui="{
          label: 'break-all text-left whitespace-normal',
          base: 'max-w-full',
        }"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from '../../models/place.model'
import { placeContactLinks } from '../../utils/place-contact'
const props = defineProps<{ place: Place }>()
const links = computed(() => placeContactLinks(props.place))
</script>
