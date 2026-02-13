<template>
  <UDashboardPanel id="dashboard-kitchen-home">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen" />
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Pill</div>
          <KitchenCardsPill v-if="pillCard" v-bind="pillCard" />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Cell</div>
          <KitchenCardsCell v-if="cellCard" v-bind="cellCard" />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Preview</div>
          <KitchenCardsPreview v-if="previewCard" v-bind="previewCard" />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Profile</div>
          <KitchenCardsProfile v-if="profileCard" :model="profileCard" />
        </div>

        <div v-if="isDev" class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Runtime debug</div>
          <pre class="rounded-md border border-default bg-muted/30 p-3 text-xs">
{{ JSON.stringify(debugPayload, null, 2) }}
          </pre>
        </div>

      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/runtime-kitchen/state'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const { runtimeKitchenId, runtimeKitchenMode } = useRuntimeKitchenSelection()
const runtimeKitchen = useRuntimeKitchen({
  kitchenId: runtimeKitchenId,
  mode: runtimeKitchenMode,
})
const { pill, cell, preview, profile } = useKitchenInterface()

const pillCard = computed(() => pill(runtimeKitchen.kitchen.value))
const cellCard = computed(() => cell(runtimeKitchen.kitchen.value))
const previewCard = computed(() => preview(runtimeKitchen.kitchen.value))
const profileCard = computed(() => profile(runtimeKitchen.kitchen.value))

const isDev = import.meta.dev

const debugPayload = computed(() => ({
  mode: runtimeKitchen.mode.value,
  runtimeKitchenId: runtimeKitchen.id.value,
  runtimeKitchen: runtimeKitchen.kitchen.value,
}))

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-home',
    label: 'Kitchen',
    icon: 'i-lucide-chef-hat',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})
</script>
