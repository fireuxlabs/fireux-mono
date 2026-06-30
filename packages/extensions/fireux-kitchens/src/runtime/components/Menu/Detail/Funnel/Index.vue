<template>
  <div
    class="menu-order-funnel"
    :class="{ 'menu-order-funnel--panel': order.panelOpen }"
  >
    <button
      v-if="!order.panelOpen"
      type="button"
      class="menu-order-basket"
      :disabled="order.pending"
      :aria-label="order.actionLabel"
      @click="$emit('openPanel')"
    >
      <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
    </button>

    <section v-else class="menu-order-card" aria-live="polite">
      <header class="menu-order-header">
        <div>
          <p class="menu-order-step-label">
            {{ surfaceNumber }} of {{ surfaceCount }}
          </p>
          <h2>{{ surfaceTitle }}</h2>
        </div>

        <button
          type="button"
          class="menu-order-fold"
          aria-label="Fold order funnel away"
          @click="$emit('closePanel')"
        >
          <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
        </button>
      </header>

      <component :is="currentSurface" v-bind="currentSurfaceProps" />

      <footer class="menu-order-footer">
        <button
          type="button"
          class="menu-order-secondary"
          :disabled="surfaceNumber === 1"
          @click="previousSurface"
        >
          Back
        </button>

        <button
          type="button"
          class="menu-order-primary"
          :disabled="continueDisabled"
          @click="nextSurface"
        >
          {{ continueLabel }}
        </button>
      </footer>

      <p v-if="order.message" class="menu-order-placeholder">
        {{ order.message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
  MenuOrderingSubmitPayload,
  CreatedMenuOrder,
} from '../../../../models/kitchen/menu/menu-ordering.model'
import Basket from './Basket.vue'
import Allergen from './Allergen.vue'
import DeliveryZone from './Delivery/Zone.vue'
import DeliveryDispatch from './Delivery/Dispatch.vue'
import CollectionDetails from './Collection/Details.vue'
import CollectionKitchen from './Collection/Kitchen.vue'
import PreOrderDetails from './PreOrder/Details.vue'
import PreOrderKitchen from './PreOrder/Kitchen.vue'
import Review from './Review.vue'
import Payment from './Payment.vue'

const props = defineProps<{
  order: MenuOrderingFunnelState
  submit?: (
    payload: MenuOrderingSubmitPayload
  ) => Promise<CreatedMenuOrder | null | undefined> | CreatedMenuOrder | null | undefined
}>()

defineEmits<{
  (event: 'closePanel'): void
  (event: 'openPanel'): void
}>()

type SurfaceKind =
  | 'basket'
  | 'allergen'
  | 'delivery-zone'
  | 'delivery-dispatch'
  | 'collection-details'
  | 'collection-kitchen'
  | 'pre-order-details'
  | 'pre-order-kitchen'
  | 'review'
  | 'payment'
type Surface = {
  component: Component
  kind: SurfaceKind
  title: string
}
const deliverySurfaces = [
  { component: Basket, kind: 'basket', title: 'Basket' },
  { component: Allergen, kind: 'allergen', title: 'Allergy check' },
  { component: DeliveryZone, kind: 'delivery-zone', title: 'Delivery area' },
  { component: DeliveryDispatch, kind: 'delivery-dispatch', title: 'Dispatch' },
  { component: Review, kind: 'review', title: 'Review' },
  { component: Payment, kind: 'payment', title: 'Payment' },
] as const satisfies readonly Surface[]
const collectionSurfaces = [
  { component: Basket, kind: 'basket', title: 'Basket' },
  { component: Allergen, kind: 'allergen', title: 'Allergy check' },
  { component: CollectionDetails, kind: 'collection-details', title: 'Collection' },
  { component: CollectionKitchen, kind: 'collection-kitchen', title: 'Kitchen' },
  { component: Review, kind: 'review', title: 'Review' },
  { component: Payment, kind: 'payment', title: 'Payment' },
] as const satisfies readonly Surface[]
const preOrderSurfaces = [
  { component: Basket, kind: 'basket', title: 'Basket' },
  { component: Allergen, kind: 'allergen', title: 'Allergy check' },
  { component: PreOrderDetails, kind: 'pre-order-details', title: 'Pre-order' },
  { component: PreOrderKitchen, kind: 'pre-order-kitchen', title: 'Kitchen' },
  { component: Review, kind: 'review', title: 'Review' },
  { component: Payment, kind: 'payment', title: 'Payment' },
] as const satisfies readonly Surface[]
const surfaceChoices = ['1', '2', '3', '4', '5', '6'] as const
type SurfaceChoice = typeof surfaceChoices[number]
const allergenAccepted = ref(false)
const fulfilmentReady = ref(false)
const deliveryState = ref<MenuOrderingDeliveryState>({ ready: false })
const orderCreated = ref(false)
const surfaces = computed(() =>
  props.order.orderType === 'collection'
    ? collectionSurfaces
    : props.order.orderType === 'pre_order'
      ? preOrderSurfaces
      : deliverySurfaces
)
const surfaceCount = computed(() => surfaces.value.length)
const { selected: surfaceChoice } = useStoredChoice<SurfaceChoice>({
  key: computed(() =>
    [
      'fireux:menu',
      props.order.kitchenSlug,
      props.order.menuId,
      'funnel-step',
      props.order.orderType,
    ].filter(Boolean).join(':')
  ),
  choices: surfaceChoices,
  fallback: '1',
})
const surfaceNumber = computed(() => Number(surfaceChoice.value))
const currentSurfaceConfig = computed(() =>
  surfaces.value[surfaceNumber.value - 1] || surfaces.value[0]
)
const currentSurface = computed(() => currentSurfaceConfig.value.component)
const surfaceTitle = computed(() =>
  currentSurfaceConfig.value.title || 'Order'
)
const currentSurfaceProps = computed(() => {
  const kind = currentSurfaceConfig.value.kind

  if (kind === 'basket') {
    return { order: props.order }
  }

  if (kind === 'allergen') {
    return {
      modelValue: allergenAccepted.value,
      'onUpdate:modelValue': (value: boolean) => {
        allergenAccepted.value = value
      },
    }
  }

  if (kind === 'delivery-zone') {
    return {
      order: props.order,
      'onUpdate:ready': (value: boolean) => {
        fulfilmentReady.value = value
      },
      'onUpdate:delivery': (value: MenuOrderingDeliveryState) => {
        deliveryState.value = value
      },
    }
  }

  if (kind === 'delivery-dispatch') {
    return {
      order: props.order,
      delivery: deliveryState.value,
    }
  }

  if (kind === 'collection-details' || kind === 'pre-order-details') {
    return {
      order: props.order,
      'onUpdate:ready': (value: boolean) => {
        fulfilmentReady.value = value
      },
    }
  }

  if (kind === 'collection-kitchen' || kind === 'pre-order-kitchen') {
    return { order: props.order }
  }

  return {}
})
const continueDisabled = computed(() =>
  surfaceNumber.value === surfaceCount.value ||
  props.order.pending ||
  (currentSurfaceConfig.value.kind === 'allergen' && !allergenAccepted.value) ||
  (
    (
      currentSurfaceConfig.value.kind === 'delivery-zone' ||
      currentSurfaceConfig.value.kind === 'collection-details' ||
      currentSurfaceConfig.value.kind === 'pre-order-details'
    ) &&
    !fulfilmentReady.value
  )
)
const continueLabel = computed(() =>
  props.order.pending ? 'Sending...' : 'Continue'
)

function previousSurface() {
  setSurfaceNumber(Math.max(1, surfaceNumber.value - 1))
}

async function nextSurface() {
  if (continueDisabled.value) return
  if (shouldCreateOrder.value && !orderCreated.value) {
    const created = await props.submit?.(fulfilmentSubmitPayload())
    if (!created) return
    orderCreated.value = true
  }
  setSurfaceNumber(Math.min(surfaceCount.value, surfaceNumber.value + 1))
}

function setSurfaceNumber(next: number) {
  surfaceChoice.value = String(next) as SurfaceChoice
}

const shouldCreateOrder = computed(() =>
  currentSurfaceConfig.value.kind === 'delivery-zone' ||
  currentSurfaceConfig.value.kind === 'collection-details' ||
  currentSurfaceConfig.value.kind === 'pre-order-details'
)

function fulfilmentSubmitPayload(): MenuOrderingSubmitPayload {
  const address = deliveryState.value.address

  return {
    ...(props.order.orderType === 'delivery'
      ? {
          customer: {
            ...(address?.formatted || address?.input
              ? { address: address.formatted || address.input }
              : {}),
            ...(address?.place_id ? { address_place_id: address.place_id } : {}),
          },
        }
      : {}),
    payment_method: 'online_card',
  }
}

watch(
  () => props.order.quantity,
  (quantity) => {
    if (!quantity) {
      allergenAccepted.value = false
      fulfilmentReady.value = false
      deliveryState.value = { ready: false }
      orderCreated.value = false
      setSurfaceNumber(1)
    }
  }
)

watch(
  () => props.order.orderType,
  () => {
    allergenAccepted.value = false
    fulfilmentReady.value = false
    deliveryState.value = { ready: false }
    orderCreated.value = false
    setSurfaceNumber(1)
  }
)
</script>
