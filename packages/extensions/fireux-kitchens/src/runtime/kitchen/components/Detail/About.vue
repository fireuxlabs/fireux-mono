<template>
  <section v-if="kitchen.about" class="space-y-3">
    <h2 class="text-xl font-semibold">
      About {{ kitchen.display_name || kitchen.name }}
    </h2>
    <p class="text-muted">{{ kitchen.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.model.ts'
defineProps<{ kitchen: KitchenDetailPresentation }>()
</script>
