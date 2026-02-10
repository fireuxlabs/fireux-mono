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
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const { theRuntimeKitchen } = useRuntimeKitchen()
const { pill, cell, preview, profile } = useKitchenInterface()

const pillCard = computed(() => pill(theRuntimeKitchen.value))
const cellCard = computed(() => cell(theRuntimeKitchen.value))
const previewCard = computed(() => preview(theRuntimeKitchen.value))
const profileCard = computed(() => profile(theRuntimeKitchen.value))


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
