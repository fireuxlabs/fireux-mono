<template>
  <UDashboardPanel id="dashboard-kitchen-menu">
    <template #header>
      <LayoutsDashboardNavbar title="Menu" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span>
          <span class="mx-2">·</span>
          Menus loaded: <span class="font-medium">{{ menus.length }}</span>
        </div>

        <MenuCollectionManager
          :collection="menus"
          title="Menus"
          description="Service menus built from kitchen dishes."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MenuCollectionManager from '../../../components/organisms/Menu/Collection/Manager.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

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

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const menus = computed(() => runtime.data.value.menus ?? [])
</script>
