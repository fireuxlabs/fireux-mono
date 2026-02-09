<template>
  <UDashboardPanel id="dashboard-kitchen-home">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen" />
    </template>

    <template #body>
      <div class="panels-stack">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-utensils-crossed" />
              Kitchen Workspace
            </div>
          </template>

          <p class="text-sm text-dimmed">
            This dashboard is isolated from the app dashboard and can be scoped
            to kitchen operations.
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <UButton
              :to="menuRoute"
              label="Menus"
              color="primary"
              icon="i-lucide-book-open-check"
              size="sm"
            />
            <UButton
              :to="ingredientsRoute"
              label="Ingredients"
              color="neutral"
              icon="i-lucide-carrot"
              size="sm"
            />
            <UButton
              :to="miseRoute"
              label="Mise en place"
              color="neutral"
              icon="i-lucide-clipboard-check"
              size="sm"
            />
            <UButton
              to="/kitchens"
              label="Kitchens"
              variant="soft"
              color="neutral"
              icon="i-lucide-store"
              size="sm"
            />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenDashboardSelection } from '../../../composables/fireux/app/useKitchenDashboardSelection'

const { runtimeKitchenId } = useKitchenDashboardSelection()

const menuRoute = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen/menu',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen/menu'
)

const ingredientsRoute = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen/ingredients',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen/ingredients'
)

const miseRoute = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen/mise',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen/mise'
)

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
