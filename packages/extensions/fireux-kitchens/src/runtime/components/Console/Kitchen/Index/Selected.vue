<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenIndexSelected</pre>

    <UPageCard
      v-if="kitchenId"
      :title="selectedTitle"
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
      description="Choose a live or demo Kitchen target to open selected Kitchen console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen?: KitchenSurface | null
  kitchenId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Kitchen' : 'Selected Kitchen'
)
</script>
