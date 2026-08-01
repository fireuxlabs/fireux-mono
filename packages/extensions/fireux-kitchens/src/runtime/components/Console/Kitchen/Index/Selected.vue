<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: replace the Kitchen-only preview fork with shared selected-target chrome. -->
<template>
  <ConsoleSelectedTarget
    label="Kitchen"
    :selected-id="kitchenId"
    :description="kitchenName"
    :target="targetCard"
    :outcome="outcome"
    icon="i-lucide-chef-hat"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    kitchen?: KitchenSurface | null
    kitchenId?: string
    source?: KitchenFetchSource
    outcome?: ConsoleTargetOutcome
  }>(),
  {
    kitchen: null,
    kitchenId: '',
    source: 'live',
    outcome: 'ready',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const { consoleTarget } = useKitchenInterface()
const kitchenCard = computed(() => consoleTarget(props.kitchen))
const targetCard = computed<ConsoleTargetCard | null>(() => {
  const card = kitchenCard.value
  if (!card) return null

  return {
    id: card.id,
    title: card.name,
    subtitle: card.shortAddress,
    imageUrl: card.imageUrl,
    imageAlt: `${card.name} logo`,
    imageFit: 'contain',
    imageBackground: card.mediaBackdropColor,
    icon: 'i-lucide-chef-hat',
    badges: [
      props.source === 'demo' ? 'Demo · Read-only' : 'Live',
    ],
  }
})
</script>
