<template>
  <UDashboardPanel id="console-kitchen-dish-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dish" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UCard>
          <template #header>
            <div class="console-card-header">
              <div class="console-card-header__title">
                Dish detail route works
              </div>
              <p class="console-card-header__description">
                Temporary route smoke test.
              </p>
            </div>
          </template>

          <div class="space-y-2">
            <p>Hello world from dish detail.</p>
            <p class="text-sm text-dimmed">
              dishId: {{ dishId }}
            </p>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()
const dishId = computed(() => {
  const raw = route.params.dishId
  return Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
})

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dish-detail',
    label: 'Dish Detail',
    icon: 'i-lucide-utensils',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
