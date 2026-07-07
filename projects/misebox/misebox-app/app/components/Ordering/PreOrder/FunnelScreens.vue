<template>
  <div
    class="fireux-menu-detail pre-order-funnel-demo mb-4"
    :class="className"
    :style="styleVars"
  >
    <article class="pre-order-funnel-screen">
      <OrderingFunnelStage number="1" order-type="pre_order" total="6">
        <MenuDetailFunnelBasket :order="order" />
      </OrderingFunnelStage>

      <OrderingObjectShape title="basket" :data="screenShapes.basket" />
    </article>

    <article class="pre-order-funnel-screen">
      <OrderingFunnelStage number="2" order-type="pre_order" total="6">
        <ClientOnly>
          <MenuDetailFunnelAllergen v-model="acceptedModel" />
        </ClientOnly>
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen"
        :data="screenShapes.withAllergen"
      />
    </article>

    <article id="pre-order-details-screen" class="pre-order-funnel-screen">
      <OrderingFunnelStage number="3" order-type="pre_order" total="6">
        <MenuDetailFunnelPreOrderDetails
          :order="order"
          @update:ready="detailsReady = $event"
        />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen + preOrder"
        :data="screenShapes.withPreOrder"
      />
    </article>

    <article class="pre-order-funnel-screen">
      <OrderingFunnelStage number="4" order-type="pre_order" total="6">
        <MenuDetailFunnelPayment :funnel="funnel" />
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen + preOrder + submission + deposit"
        :data="screenShapes.withDeposit"
      />
    </article>

    <article class="pre-order-funnel-screen">
      <OrderingFunnelStage number="5" order-type="pre_order" total="6">
        <MenuDetailFunnelPreOrderKitchen />

        <section
          v-if="!depositPaid"
          class="mt-3 rounded-lg border border-default bg-muted/40 p-3 text-sm font-semibold text-muted"
        >
          Kitchen receives this after the deposit is paid.
        </section>

        <section
          v-else-if="kitchenOutcome?.status === 'rejected'"
          class="mt-3 grid gap-3 rounded-lg border border-error/20 bg-error/5 p-3"
        >
          <div class="grid gap-1">
            <strong class="text-sm font-black text-highlighted">
              Kitchen could not accept this pre-order
            </strong>
            <p class="m-0 text-sm font-semibold text-muted">
              {{ kitchenOutcome.note }}
            </p>
          </div>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            @click="returnToPreOrderDetails"
          >
            Back to pre-order details
          </UButton>
        </section>
      </OrderingFunnelStage>

      <OrderingObjectShape
        title="order + allergen + preOrder + submission + deposit + given"
        :data="screenShapes.kitchenInput"
      />
    </article>

    <OrderingKitchenReceiving
      v-if="depositPaid"
      :key="kitchenReceivingResetKey"
      :receiving="kitchenReceiving"
      title="kitchen receives paid pre-order"
      @update:outcome="updateKitchenOutcome"
    />

    <article class="pre-order-funnel-screen">
      <OrderingFunnelStage number="6" order-type="pre_order" total="6">
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
import type {
  MenuOrderingBasket,
  MenuOrderingDraft,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingKitchenIntake,
  MenuOrderingPreOrderState,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  allergenAccepted: boolean
  className: string
  funnel: MenuOrderingFunnelController
  kitchenIntake: MenuOrderingKitchenIntake
  kitchenReceiving: OrderingKitchenReceiving
  order: MenuOrderingFunnelState
  preOrder: MenuOrderingPreOrderState
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

const detailsReady = ref(false)
const kitchenOutcome = ref<KitchenOutcome | null>(null)
const kitchenReceivingResetKey = ref(0)
const acceptedModel = computed({
  get: () => props.allergenAccepted,
  set: (value: boolean) => {
    emit('update:allergenAccepted', value)
  },
})
const depositPaid = computed(() =>
  props.funnel.processing.order?.payment?.status === 'paid' ||
    props.funnel.processing.status === 'pending_acceptance' ||
    props.funnel.processing.status === 'open'
)
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
  const withPreOrder: MenuOrderingDraft = {
    ...withAllergen,
    preOrder: incoming.pre_order || props.preOrder,
  }

  return {
    basket,
    withAllergen,
    withPreOrder,
    withDeposit: {
      ...props.kitchenIntake,
      payment: processing.order?.payment || null,
      status: processing.status,
    },
    kitchenInput: {
      ...props.kitchenIntake,
      payment: processing.order?.payment || null,
      given: {
        status: processing.status,
        fire_state: processing.fire_state,
      },
    },
    processingOrder: processing.order,
  }
})

function returnToPreOrderDetails() {
  kitchenOutcome.value = null
  kitchenReceivingResetKey.value += 1
  props.funnel.processing.status = 'pending_payment'
  props.funnel.processing.fire_state = 'held'
  if (props.funnel.processing.order) {
    props.funnel.processing.order.status = 'pending_payment'
    props.funnel.processing.order.fire_state = 'held'
  }

  if (!import.meta.client) return
  document
    .getElementById('pre-order-details-screen')
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
  }
}
</script>

<style scoped>
.pre-order-funnel-demo {
  display: grid;
  gap: 1rem;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;
}

.pre-order-funnel-screen {
  display: grid;
  gap: 1rem;
  align-items: start;
}

.pre-order-funnel-demo :deep(.menu-order-card) {
  width: 100%;
  max-height: none;
  box-shadow: none;
}

@media (min-width: 1024px) {
  .pre-order-funnel-screen {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.9fr);
  }
}
</style>
