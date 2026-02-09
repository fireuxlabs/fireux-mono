<template>
  <section class="space-y-3">
    <ClientOnly>
      <UCard v-if="!kitchen" variant="subtle">
        <p class="text-sm text-dimmed">Kitchen data unavailable.</p>
      </UCard>

      <UCard v-else variant="subtle">
        <p class="text-sm text-dimmed">
          Kitchen is a thin marker on top of Place. There are no kitchen-specific fields to edit yet.
        </p>
      </UCard>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'

const props = defineProps<{ kitchen: Kitchen | null }>()
const kitchen = computed(() => props.kitchen)
</script>
