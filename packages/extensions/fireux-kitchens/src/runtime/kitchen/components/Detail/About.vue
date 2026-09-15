<template>
  <section
    v-if="kitchen.about"
    id="about"
    class="max-w-3xl scroll-mt-24 space-y-4 border-t border-default py-8"
  >
    <h2 class="text-xl font-semibold">
      About {{ kitchen.display_name || kitchen.name }}
    </h2>
    <p class="text-base leading-relaxed text-toned">{{ kitchen.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
defineProps<{ kitchen: KitchenDetailPresentation }>()
</script>
