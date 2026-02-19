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
          Kitchen: <span class="font-medium">{{ kitchenId || 'none' }}</span>
          <span class="mx-2">·</span>
          Menus loaded: <span class="font-medium">{{ menus.length }}</span>
        </div>

        <UCard v-if="menus.length">
          <div class="space-y-2">
            <div
              v-for="menu in menus"
              :key="menu.id"
              class="rounded border border-default p-3"
            >
              <div class="font-bold">{{ menu.name }}</div>
              <div class="text-sm text-dimmed">
                Sections: {{ menu.sections?.length || 0 }}
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No menus loaded"
          description="No menu documents found for the current kitchen context."
        />

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
const kitchenId = runtime.id
const menus = computed(() => runtime.data.value.menus ?? [])
</script>
