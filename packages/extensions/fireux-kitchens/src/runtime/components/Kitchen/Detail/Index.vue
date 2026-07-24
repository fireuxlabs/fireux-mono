<template>
  <UPage>
    <UPageBody class="pagebody">
      <UPageCard v-if="outcome === 'pending'" variant="subtle">
        <p class="text-sm text-dimmed">Loading kitchen…</p>
      </UPageCard>

      <UPageCard
        v-else-if="outcome === 'error'"
        title="Kitchen unavailable"
        description="This kitchen could not be loaded. Please try again."
        variant="subtle"
      />

      <UPageCard
        v-else-if="!kitchen"
        title="Kitchen not found"
        description="This kitchen does not exist or is not public-ready."
        variant="subtle"
      />

      <div v-else class="kitchen-detail">
        <KitchenDetailIdentity :kitchen="kitchen" />

        <KitchenDetailMenus :kitchen="kitchen" />

        <KitchenDetailFulfilment
          :kitchen="kitchen"
          :fulfilment="resolvedFulfilment"
        />

        <KitchenDetailOperatorPanel :kitchen="kitchen" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenFulfilmentConfig } from '../../../models/kitchen.model'
import type { PublicKitchenDetail } from '../../../models/kitchen/kitchen-index.model'
import type { KitchenDetailOutcome } from '../../../composables/fireux/kitchen/useKitchenDetail'

const props = defineProps<{
  kitchen?: PublicKitchenDetail | null
  outcome: KitchenDetailOutcome
}>()

const kitchen = computed(() =>
  props.kitchen as KitchenSurface | null | undefined
)
const locator = computed(() => String(props.kitchen?.slug || '').trim())
const emptyFulfilment: KitchenFulfilmentConfig = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  locator.value
    ? `/api/kitchens/${encodeURIComponent(locator.value)}/fulfilment`
    : ''
)

const { data: fulfilmentData } = useFetch<KitchenFulfilmentConfig>(
  fulfilmentPath,
  {
    immediate: Boolean(fulfilmentPath.value),
    watch: [fulfilmentPath],
  }
)
const resolvedFulfilment = computed(() => fulfilmentData.value || emptyFulfilment)
</script>

<style scoped>
.kitchen-detail {
  display: grid;
  gap: clamp(calc(var(--spacing) * 9), 5vw, calc(var(--spacing) * 16));
  padding-bottom: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
}
</style>
