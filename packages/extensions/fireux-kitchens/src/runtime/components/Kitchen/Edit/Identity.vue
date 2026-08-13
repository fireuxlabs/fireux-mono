<template>
  <div class="space-y-4">
    <KitchenEditFields
      :kitchen="kitchenRecord"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
    <KitchenEditImage
      :kitchen="kitchenRecord"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
    <KitchenEditLogo
      :kitchen="kitchenRecord"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
    <KitchenEditWordmark
      :kitchen="kitchenRecord"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
    <KitchenEditPublication
      :kitchen="kitchenRecord"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'

const props = defineProps<{
  kitchen: Partial<Kitchen> | Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const kitchenRecord = computed(() => props.kitchen as Record<string, unknown> | null)
</script>
