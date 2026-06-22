<template>
  <section class="space-y-2">
    <KitchenCardsPreview
      v-if="previewModel"
      v-bind="previewModel"
      :show-badges="false"
    />

    <UPageCard
      v-else-if="kitchenId"
      title="Selected kitchen"
      :description="kitchenName || kitchenId"
      variant="subtle"
    />

    <UPageCard
      v-else
      title="No selected kitchen"
      description="Choose a kitchen target to open selected kitchen console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen?: KitchenSurface | null
  kitchenId?: string
}>()

const { preview } = useKitchenInterface()

const kitchenName = computed(() =>
  String(props.kitchen?.name || props.kitchen?.slug || '').trim()
)
const previewModel = computed(() => preview(props.kitchen))
</script>
