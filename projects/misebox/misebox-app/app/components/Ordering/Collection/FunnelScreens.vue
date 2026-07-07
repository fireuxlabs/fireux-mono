<template>
  <div
    class="fireux-menu-detail collection-funnel-demo mb-4"
    :class="className"
    :style="styleVars"
  >
    <article class="collection-funnel-screen">
      <OrderingFunnelStage number="1" order-type="collection" total="6">
        <MenuDetailFunnelBasket :order="order" />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="basket"
        :data="screenShapes.basket"
      />
    </article>

    <article class="collection-funnel-screen">
      <OrderingFunnelStage number="2" order-type="collection" total="6">
        <ClientOnly>
          <MenuDetailFunnelAllergen v-model="acceptedModel" />
        </ClientOnly>
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen"
        :data="screenShapes.withAllergen"
      />
    </article>

    <article id="collection-request-screen" class="collection-funnel-screen">
      <OrderingFunnelStage number="3" order-type="collection" total="6">
        <MenuDetailFunnelCollectionRequest :state="state" />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen + collection"
        :data="screenShapes.withCollection"
      />
    </article>

    <article class="collection-funnel-screen">
      <OrderingFunnelStage number="4" order-type="collection" total="6">
        <MenuDetailFunnelCollectionKitchen :funnel="funnel" />

        <section
          v-if="kitchenOutcome?.status === 'rejected'"
          class="mt-3 grid gap-3 rounded-lg border border-error/20 bg-error/5 p-3"
        >
          <div class="grid gap-1">
            <strong class="text-sm font-black text-highlighted">
              Kitchen could not accept this order
            </strong>
            <p class="m-0 text-sm font-semibold text-muted">
              {{ kitchenOutcome.note }}
            </p>
          </div>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            @click="returnToCollectionRequest"
          >
            Back to collection time
          </UButton>
        </section>
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen + collection + submission"
        :data="kitchenIntake"
      />
    </article>

    <OrderingKitchenReceiving
      :key="kitchenReceivingResetKey"
      :receiving="kitchenReceiving"
      title="order + allergen + collection + submission + given"
      @update:outcome="updateKitchenOutcome"
    />

    <article class="collection-funnel-screen">
      <OrderingFunnelStage number="5" order-type="collection" total="6">
        <MenuDetailFunnelPayment :funnel="funnel" />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="created ticket"
        :data="screenShapes.processing"
      />
    </article>

    <article class="collection-funnel-screen">
      <OrderingFunnelStage number="6" order-type="collection" total="6">
        <MenuDetailFunnelConfirmation :funnel="funnel" />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="kitchen order"
        :data="screenShapes.processingOrder"
      />
    </article>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  type StyleValue,
} from 'vue'
import type { OrderingKitchenReceiving } from '~/utils/orderingFunnelShapes'
import type { MenuOrderingCollectionFunnel } from 'fireux-kitchens/runtime/composables/fireux/kitchen/order/funnel/Collection/useCollection'
import type {
  MenuOrderingBasket,
  MenuOrderingDraft,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingKitchenIntake,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  allergenAccepted: boolean
  className: string
  funnel: MenuOrderingFunnelController
  kitchenIntake: MenuOrderingKitchenIntake
  kitchenReceiving: OrderingKitchenReceiving
  order: MenuOrderingFunnelState
  state: MenuOrderingCollectionFunnel
  styleVars: StyleValue
}>()

const emit = defineEmits<{
  (event: 'update:allergenAccepted', value: boolean): void
}>()

type KitchenOutcome =
  | {
      status: 'accepted'
      estimatedMinutes: number | null
    }
  | {
      status: 'rejected'
      note: string
    }

const kitchenOutcome = ref<KitchenOutcome | null>(null)
const kitchenReceivingResetKey = ref(0)
const acceptedModel = computed({
  get: () => props.allergenAccepted,
  set: (value: boolean) => {
    emit('update:allergenAccepted', value)
  },
})
const screenShapes = computed(() => {
  const { incoming, processing } = props.funnel
  const basket: MenuOrderingBasket = {
    items: props.order.selection.items,
    quantity: props.order.selection.quantity,
  }
  const withAllergen: MenuOrderingDraft = {
    orderType: props.order.orderType,
    basket,
    allergen: {
      checked: Boolean(incoming.allergen_checked),
    },
  }
  const withCollection: MenuOrderingDraft = {
    ...withAllergen,
    collection: incoming.collection,
  }

  return {
    basket,
    withAllergen,
    withCollection,
    processing,
    processingOrder: processing.order,
  }
})

function returnToCollectionRequest() {
  kitchenOutcome.value = null
  kitchenReceivingResetKey.value += 1
  props.funnel.processing.status = 'pending_acceptance'
  props.funnel.processing.fire_state = 'held'
  if (props.funnel.processing.order) {
    props.funnel.processing.order.status = 'pending_acceptance'
    props.funnel.processing.order.fire_state = 'held'
  }

  if (!import.meta.client) return
  document
    .getElementById('collection-request-screen')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function updateKitchenOutcome(outcome: KitchenOutcome | null) {
  kitchenOutcome.value = outcome
  if (!outcome) return

  if (outcome.status === 'rejected') {
    props.funnel.processing.status = 'cancelled'
    props.funnel.processing.fire_state = 'held'
    if (props.funnel.processing.order) {
      const order = props.funnel.processing.order as Record<string, unknown>
      props.funnel.processing.order.status = 'cancelled'
      props.funnel.processing.order.fire_state = 'held'
      order.kitchen_note = outcome.note
    }
    return
  }

  props.funnel.processing.status = 'open'
  props.funnel.processing.fire_state = 'held'
  props.funnel.order.accepted = true
  if (props.funnel.processing.order) {
    props.funnel.processing.order.status = 'open'
    props.funnel.processing.order.fire_state = 'held'
    if (outcome.estimatedMinutes !== null) {
      const order = props.funnel.processing.order as Record<string, unknown>
      const estimatedReadyAt = etaAt(outcome.estimatedMinutes)
      props.funnel.processing.estimated_ready_minutes = outcome.estimatedMinutes
      props.funnel.processing.estimated_ready_at = estimatedReadyAt
      order.estimated_ready_minutes = outcome.estimatedMinutes
      order.estimated_ready_at = estimatedReadyAt
    }
  }
}

function etaAt(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}
</script>

<style scoped>
.collection-funnel-demo {
  display: grid;
  gap: 1rem;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;
}

.collection-funnel-screen {
  display: grid;
  gap: 1rem;
  align-items: start;
}

.collection-funnel-demo :deep(.menu-order-card) {
  width: 100%;
  max-height: none;
  box-shadow: none;
}

@media (min-width: 1024px) {
  .collection-funnel-screen {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.9fr);
  }
}
</style>
