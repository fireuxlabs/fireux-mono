<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: replace the Kitchen-only preview fork with shared selected-target chrome. -->
<template>
  <ConsoleSelectedTarget
    label="Kitchen"
    :selected-id="kitchenId"
    :description="kitchenName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen?: KitchenSurface | null
  kitchenId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
</script>
