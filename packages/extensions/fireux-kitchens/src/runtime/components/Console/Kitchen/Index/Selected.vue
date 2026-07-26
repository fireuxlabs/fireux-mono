<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: replace the Kitchen-only preview fork with shared selected-target chrome. -->
<template>
  <ConsoleSelectedTarget
    label="Kitchen"
    :selected-id="kitchenId"
    :description="kitchenName"
    @clear="emit('clear')"
  >
    <template #selected="{ title }">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-toned">
            {{ title }}
          </p>

          <UBadge
            color="neutral"
            :variant="source === 'demo' ? 'soft' : 'subtle'"
            size="sm"
          >
            {{ source === 'demo' ? 'Demo · Read-only' : 'Live' }}
          </UBadge>
        </div>

        <KitchenCardsCell
          v-if="kitchenCard"
          v-bind="kitchenCard"
          :link="false"
          :show-badges="false"
          selected
        />

        <p v-else class="text-sm text-highlighted">
          {{ kitchenName || kitchenId }}
        </p>
      </div>
    </template>
  </ConsoleSelectedTarget>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    kitchen?: KitchenSurface | null
    kitchenId?: string
    source?: KitchenFetchSource
  }>(),
  {
    kitchen: null,
    kitchenId: '',
    source: 'live',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const { cell } = useKitchenInterface()
const kitchenCard = computed(() => cell(props.kitchen))
</script>
