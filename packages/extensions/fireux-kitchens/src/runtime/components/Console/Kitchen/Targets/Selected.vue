<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenTargetsSelected</pre>

    <UPageCard
      v-if="kitchenId"
      title="Selected Kitchen"
      :description="kitchenName || kitchenId"
      variant="subtle"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="emit('clear')"
        >
          Clear
        </UButton>
      </template>
    </UPageCard>

    <UPageCard
      v-else
      title="No selected Kitchen"
      description="Choose a live Kitchen target to open the selected Kitchen console."
      variant="subtle"
    />
  </section>
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
