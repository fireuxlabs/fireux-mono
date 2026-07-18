<template>
  <UDashboardPanel id="kitchen-orders">
    <template #header>
      <UDashboardNavbar title="Orders" :toggle="false">
        <template #leading>
          <NuxtLink to="/" aria-label="Home">
            <AppBrandWordmark size="card" alt="Misebox" />
          </NuxtLink>
        </template>

        <template #right>
          <div id="kitchen-orders-actions" />
          <UButton
            to="/console/kitchen"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Close orders"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <section v-if="selectionBlocked" class="kitchen-orders-layout__empty">
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-list-checks"
          title="Select Kitchen first"
          description="Orders need an active Kitchen before the board can load."
          :actions="[
            {
              label: 'Choose Kitchen',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />
      </section>

      <NuxtPage v-else />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

defineOptions({ name: 'KitchenOrdersLayout' })

const normalizeString = (value: unknown) => String(value ?? '').trim()
const kitchenSelection = useConsoleSelection('kitchen')
const selectionBlocked = computed(() =>
  !normalizeString(kitchenSelection.selectedId.value)
)
</script>

<style scoped>
.kitchen-orders-layout__empty {
  display: grid;
  min-height: 55vh;
  place-items: center;
}

.kitchen-orders-layout__empty > * {
  width: min(100%, 42rem);
}
</style>
