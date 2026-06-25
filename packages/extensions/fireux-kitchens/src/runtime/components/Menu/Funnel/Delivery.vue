<template>
  <div class="menu-order-funnel">
    <section
      class="delivery-map"
      aria-label="Delivery area map"
    >
      <div class="delivery-map__canvas">
        <iframe
          title="Google map for delivery area"
          :src="googleMapSrc"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
          credentialless
        />

        <div
          v-if="deliveryZones.length"
          class="delivery-map__zones"
          aria-hidden="true"
        >
          <span
            v-for="zone in deliveryZones"
            :key="zone.id"
            class="delivery-map__zone"
            :style="zone.style"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
} from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'

// Menu ordering funnel: docs/concepts/menu-ordering.md
const zoneColors = ['#fb923c', '#2dd4bf', '#facc15', '#38bdf8'] as const
const googleMapSrc =
  'https://www.google.com/maps?q=Ringgenberg%20Interlaken%20Brienzersee%20Switzerland&output=embed'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

type DeliveryZoneView = MenuDeliveryZone & {
  style: Record<string, string>
}

const deliveryZones = computed<DeliveryZoneView[]>(() =>
  (props.policy?.fulfilment?.delivery_zones || []).map((zone, index) => ({
    ...zone,
    style: zoneStyle(zone, index),
  }))
)

function zoneStyle(zone: MenuDeliveryZone, index: number) {
  const color = zoneColors[index % zoneColors.length]
  const overlays: Record<string, Record<string, string>> = {
    'ringgenberg-goldswil': {
      inset: '30% 43% 37% 34%',
      clipPath: 'polygon(5% 45%, 25% 12%, 96% 0, 88% 45%, 55% 78%, 18% 100%)',
    },
    'interlaken-area': {
      inset: '44% 47% 23% 26%',
      clipPath: 'polygon(0 32%, 20% 0, 88% 22%, 100% 74%, 34% 100%)',
    },
    niederried: {
      inset: '24% 25% 47% 50%',
      clipPath: 'polygon(4% 42%, 28% 4%, 100% 24%, 78% 94%, 14% 100%)',
    },
    'brienz-west': {
      inset: '12% 6% 57% 64%',
      clipPath: 'polygon(0 10%, 70% 0, 100% 55%, 60% 100%, 8% 76%)',
    },
  }

  return {
    '--zone-color': color,
    ...(overlays[zone.id] || {
      inset: `${18 + index * 8}% ${12 + index * 6}% ${46 - index * 5}% ${18 + index * 7}%`,
      clipPath: 'polygon(8% 30%, 45% 0, 100% 26%, 84% 88%, 22% 100%, 0 62%)',
    }),
  }
}
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.delivery-map {
  display: grid;
  gap: 0.75rem;
}

.delivery-map__canvas {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 1.15rem;
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-text));
}

.delivery-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.delivery-map__zones {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.delivery-map__zone {
  position: absolute;
  border: 2px solid color-mix(in srgb, var(--zone-color) 86%, transparent);
  background: var(--zone-color);
  opacity: 0.34;
  box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--menu-text) 20%, transparent);
}
</style>
