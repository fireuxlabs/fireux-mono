<template>
  <section class="receiving-overview" aria-label="Incoming order surfaces">
    <strong class="receiving-overview__title">Waiting</strong>

    <div class="receiving-overview__surfaces">
      <UBadge
        v-for="surface in activeSurfaces"
        :key="surface.label"
        color="neutral"
        variant="soft"
        :icon="surface.icon"
      >
        {{ surface.label }} {{ surface.count }}
      </UBadge>
    </div>

    <p class="receiving-overview__note">
      Room service and table orders join Queue automatically.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingOverview' })

const props = defineProps<{
  collectionCount: number
  deliveryCount: number
  preOrderCount: number
}>()

const activeSurfaces = computed(() => [
  {
    label: 'Collection',
    count: props.collectionCount,
    icon: 'i-lucide-shopping-bag',
  },
  {
    label: 'Delivery',
    count: props.deliveryCount,
    icon: 'i-lucide-bike',
  },
  {
    label: 'Pre-order',
    count: props.preOrderCount,
    icon: 'i-lucide-calendar-clock',
  },
].filter((surface) => surface.count > 0))
</script>

<style scoped>
.receiving-overview,
.receiving-overview__surfaces {
  display: grid;
}

.receiving-overview {
  gap: calc(var(--spacing) * 2);
}

.receiving-overview__title {
  font-size: 0.875rem;
}

.receiving-overview__surfaces {
  gap: var(--spacing);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.receiving-overview__note {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  margin: 0;
}
</style>
