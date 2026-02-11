<template>
  <UDashboardPanel id="dashboard-kitchen-menu">
    <template #header>
      <LayoutsDashboardNavbar title="Menu" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Lumen Burger Board</h2>
                <UBadge variant="soft" color="neutral">
                  {{ runtimeKitchenName }}
                </UBadge>
              </div>
              <p class="text-xs text-dimmed">
                Five signature burgers, built from the Lumen scenario stack.
              </p>
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-semibold">Menus</div>
              <UBadge variant="soft">{{ menus.length }}</UBadge>
            </div>
          </template>

          <div v-if="menus.length" class="space-y-2">
            <div
              v-for="menu in menus"
              :key="menu.id"
              class="rounded-md border border-default p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm font-semibold">{{ menu.name }}</div>
                <UBadge variant="soft" color="neutral">{{ menu.status }}</UBadge>
              </div>
              <p class="text-xs text-dimmed">
                {{ menu.description || 'No description yet.' }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2 text-xs text-dimmed">
                <span>Service: {{ menu.service }}</span>
                <span>Dishes: {{ menu.dish_ids?.length || 0 }}</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-dimmed">No menus yet.</p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenName = computed(() => String(runtimeKitchen.value?.name || ''))
const menus = ref([...dummyKitchenScenario.menuStack.menus])
</script>

