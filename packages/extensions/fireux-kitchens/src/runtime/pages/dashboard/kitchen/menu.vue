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
                <h2 class="text-base font-semibold">Menu board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Menus for the active runtime kitchen (collection output: [menu]).
              </p>
            </div>
          </template>
        </UCard>

        <MenuCollectionManager
          v-if="menusOrganized.length"
          :collection="menusOrganized"
          title="Menus"
          description="Organize and sort kitchen menus as a collection."
        />
        <p v-else class="text-sm text-dimmed">No menus yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import MenuCollectionManager from '../../../components/organisms/Menu/Collection/Manager.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

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
const { pill: kitchenPillBuilder } = useKitchenInterface()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const { menus: firestoreMenus } = useKitchenMenuStackFetch(runtimeKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const dummyMenus = ref([...dummyKitchenScenario.menuStack.menus])

// TODO(kitchen-menu-sync): Add "Import from Google" into draft menus and flag likely missing items
// because many restaurants have partial/outdated online menu coverage.
const menus = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? dummyMenus.value
    : [...(firestoreMenus.value ?? [])]
)

const menusOrganized = computed(() =>
  [...menus.value].sort((a, b) =>
    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
    String(a.name || '').localeCompare(String(b.name || ''))
  )
)
</script>
