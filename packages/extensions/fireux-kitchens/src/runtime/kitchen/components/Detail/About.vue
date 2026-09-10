<template>
  <section v-if="kitchen.about" class="space-y-3">
    <h2 class="fx-type-section-title">
      About {{ kitchen.display_name || kitchen.name }}
    </h2>
    <p class="max-w-prose whitespace-pre-line leading-relaxed text-muted">{{ kitchen.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
defineProps<{ kitchen: KitchenDetailPresentation }>()
</script>
