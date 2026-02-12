<template>
  <UDashboardPanel id="dashboard-kitchen-mise">
    <template #header>
      <LayoutsDashboardNavbar title="Mise en Place" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Mise en place board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Prep tasks for the active runtime kitchen.
              </p>
            </div>
          </template>
        </UCard>

        <MiseCollectionManager
          v-if="miseTasks.length"
          :collection="miseTasks"
          title="Mise Tasks"
          description=""
        />
        <p v-else class="text-sm text-dimmed">No mise tasks yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import MiseCollectionManager from '../../../components/organisms/Mise/Collection/Manager.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 2,
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
const { miseTasks: firestoreMiseTasks } = useKitchenMenuStackFetch(runtimeKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})

const dummyMiseTasks = ref([...dummyKitchenScenario.menuStack.miseTasks])

const miseTasks = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? dummyMiseTasks.value
    : [...(firestoreMiseTasks.value ?? [])]
)
</script>
