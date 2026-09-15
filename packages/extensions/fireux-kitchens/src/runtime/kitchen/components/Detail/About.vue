<template>
  <section v-if="kitchen.about" class="max-w-3xl space-y-4 py-3">
    <h2 class="text-xl font-semibold">
      About {{ kitchen.display_name || kitchen.name }}
    </h2>
    <p class="text-lg leading-relaxed text-toned">{{ kitchen.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
defineProps<{ kitchen: KitchenDetailPresentation }>()
</script>
