<template>
  <UContainer>
    <FireStateCard
      v-if="flow.menu.pending"
      entity="Menu"
      kind="document"
      loading
    />
    <FireStateCard
      v-else-if="flow.menu.failure"
      entity="Menu"
      kind="document"
      state="error"
      title="Menu unavailable"
      description="This menu could not be loaded. Please try again."
    />
    <FireStateCard
      v-else-if="!flow.manifest"
      entity="Menu"
      kind="document"
      state="empty"
      title="Menu unavailable"
      description="This menu is unavailable for ordering."
    />
    <UAlert
      v-else-if="!flow.submission && !flow.serviceAvailable"
      color="neutral"
      title="This service is unavailable"
      description="Choose another service from the menus page."
    />
    <UPage v-else>
      <UPageHeader
        :title="`${flow.title} · ${flow.manifest.content.name}`"
        :description="flow.manifest.presentation.kitchenName"
      >
        <template #links>
          <UButton
            v-if="flow.cart.length && !flow.submission"
            aria-controls="menu-order-cart"
            @click="cartRegion?.scrollIntoView({ block: 'start' })"
            :label="`Your order · ${flow.cart.reduce((sum, line) => sum + line.quantity, 0)}`"
            variant="soft"
          />
        </template>
      </UPageHeader>
      <UPageBody>
      <UAlert
        v-if="!flow.submission && !flow.serviceOpen"
        color="neutral"
        title="This service is closed"
        description="Please order during its serving hours."
      />
      <MenuOrderResponse
        v-if="flow.submission"
        :submission="flow.submission"
        :response-title="flow.responseTitle"
        :response-message="flow.responseMessage"
        :pending="flow.pending"
        @reset="flow.reset"
      />
      <div v-else class="menu-order-layout">
        <MenuOrderMenuItems
          :sections="flow.manifest.content.sections"
          :pending="flow.pending"
          :money="flow.money"
          @add="flow.add"
        >
          <UFormField v-if="context === 'table'" label="Table / location">
            <UInput
              v-model="flow.location"
              :maxlength="200"
              placeholder="Your table number"
            />
          </UFormField>
        </MenuOrderMenuItems>
        <aside ref="cartRegion" id="menu-order-cart">
          <MenuOrderCheckout :flow="flow" :context="context" />
        </aside>
      </div>
      <UAlert v-if="flow.error" color="error" :description="flow.error" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'

import { useMenuOrderFlow } from '../../composables/useMenuOrderFlow'
import type { MenuOrderInput } from '../../models/menu-order-flow.model'
const props = defineProps<MenuOrderInput>()
const cartRegion = ref<HTMLElement | null>(null)
const flow = reactive(useMenuOrderFlow(props))
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
