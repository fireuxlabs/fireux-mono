<template>
  <UContainer class="py-8">
    <p v-if="menu.pending.value">Loading menu…</p>
    <UAlert
      v-else-if="menu.failure.value || !manifest"
      color="error"
      description="This menu is unavailable for ordering."
    />
    <UAlert
      v-else-if="!submission && !serviceAvailable"
      color="neutral"
      title="This service is unavailable"
      description="Choose another service from the menus page."
    />
    <div v-else class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm text-muted">
            {{ manifest.presentation.kitchenName }}
          </p>
          <h1 class="text-2xl font-bold">
            {{ title }} · {{ manifest.content.name }}
          </h1>
        </div>
        <UButton
          v-if="cart.length && !submission"
          to="#menu-order-cart"
          :label="`Your order · ${cart.reduce((sum, line) => sum + line.quantity, 0)}`"
          variant="soft"
        />
      </header>
      <UAlert
        v-if="!submission && !serviceOpen"
        color="neutral"
        title="This service is closed"
        description="Please order during its serving hours."
      />
      <OrderResponse
        v-if="submission"
        :submission="submission"
        :response-title="responseTitle"
        :response-message="responseMessage"
        :pending="pending"
        @reset="reset"
      />
      <div v-else class="menu-order-layout">
        <MenuItems
          :sections="manifest.content.sections"
          :pending="pending"
          :money="money"
          @add="add"
        >
          <UFormField v-if="context === 'table'" label="Table / location">
            <UInput
              v-model="location"
              :maxlength="200"
              placeholder="Your table number"
            />
          </UFormField>
        </MenuItems>
        <aside id="menu-order-cart" class="space-y-4">
          <OrderCart
            :lines="cart"
            :total="total"
            :money="money"
            :pending="pending"
            @adjust="adjust"
          >
            <fieldset v-if="cart.length" :disabled="pending" class="space-y-3">
              <OrderDetails
                v-model:name="name"
                v-model:phone="phone"
                v-model:address="address"
                :context="context"
              />
              <p
                v-for="issue in issues"
                :key="issue"
                class="text-sm text-muted"
              >
                {{ issue }}
              </p>
              <UButton
                label="Submit order"
                block
                size="lg"
                :disabled="issues.length > 0 || !currentUser"
                :loading="pending"
                @click="submit"
              />
            </fieldset>
          </OrderCart>
        </aside>
      </div>
      <UAlert v-if="error" color="error" :description="error" />
    </div>
  </UContainer>
</template>
<script setup lang="ts">
import {
  useMenuOrderFlow,
  type MenuOrderInput,
} from '../composables/useMenuOrderFlow'
import MenuItems from './Order/MenuItems.vue'
import OrderCart from './Order/Cart.vue'
import OrderDetails from './Order/Details.vue'
import OrderResponse from './Order/Response.vue'
const props = defineProps<MenuOrderInput>()
const {
  menu,
  manifest,
  serviceAvailable,
  serviceOpen,
  cart,
  name,
  phone,
  address,
  location,
  submission,
  title,
  money,
  total,
  issues,
  currentUser,
  pending,
  error,
  add,
  adjust,
  submit,
  reset,
  responseTitle,
  responseMessage,
} = useMenuOrderFlow(props)
</script>
<style scoped>
.menu-order-layout {
  display: grid;
  gap: 32px;
  align-items: start;
}
@media (min-width: 900px) {
  .menu-order-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
  .menu-order-layout > aside {
    position: sticky;
    top: 24px;
  }
}
</style>
