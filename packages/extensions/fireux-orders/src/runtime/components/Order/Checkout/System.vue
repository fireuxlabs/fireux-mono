<template>
  <UPage>
    <UPageHeader title="Basket & Checkout" :description="checkoutDescription">
      <template #ctas>
        <UButton size="xs" variant="ghost" icon="i-lucide-arrow-left" :to="backToMenu">
          Back to menu
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <CheckoutKitchenPill :kitchen-id="checkoutKitchenId" :label="kitchenDisplayPill" />

      <CheckoutConfirmedPanel
        v-if="confirmedOrderId"
        :order-id="confirmedOrderId"
        :back-to-menu="backToMenu"
      />

      <UAlert
        v-else-if="isEmpty"
        color="neutral"
        variant="soft"
        title="Your basket is empty"
        description="Add items from a kitchen menu to continue checkout."
      >
        <template #actions>
          <UButton size="sm" color="neutral" variant="soft" :to="backToMenu">
            Browse menu
          </UButton>
        </template>
      </UAlert>

      <template v-else>
        <CheckoutBasketCard
          :items="items"
          :subtotal-minor="subtotalMinor"
          :currency-code="currencyCode"
          @increment="incrementAt"
          @decrement="decrementAt"
          @remove="removeAt"
        />

        <CheckoutCard
          :service-mode="serviceMode"
          :service-mode-locked="serviceModeLocked"
          :table-label="tableLabel"
          :table-locked="tableLocked"
          :notes="notes"
          :submitting="submitting"
          :is-empty="isEmpty"
          @update:service-mode="onServiceModeUpdate"
          @update:table-label="onTableLabelUpdate"
          @update:notes="onNotesUpdate"
          @clear="reset"
          @confirm="submitCheckout"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import type { OrderServiceMode } from '../../../../models/order.model'
import CheckoutBasketCard from './BasketCard.vue'
import CheckoutCard from './CheckoutCard.vue'
import CheckoutConfirmedPanel from './ConfirmedPanel.vue'
import CheckoutKitchenPill from './KitchenPill.vue'
import { useOrderCheckoutState } from '../../../../composables/useOrderCheckoutState'

const {
  items,
  subtotalMinor,
  currencyCode,
  isEmpty,
  incrementAt,
  decrementAt,
  removeAt,
  reset,
  checkoutKitchenId,
  kitchenDisplayPill,
  backToMenu,
  checkoutDescription,
  serviceMode,
  serviceModeLocked,
  tableLabel,
  tableLocked,
  notes,
  submitting,
  confirmedOrderId,
  submitCheckout,
} = useOrderCheckoutState()

const onServiceModeUpdate = (value: OrderServiceMode) => {
  serviceMode.value = value
}

const onTableLabelUpdate = (value: string) => {
  tableLabel.value = String(value || '')
}

const onNotesUpdate = (value: string) => {
  notes.value = String(value || '')
}
</script>
