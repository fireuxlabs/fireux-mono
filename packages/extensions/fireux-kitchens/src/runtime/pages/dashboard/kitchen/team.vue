<template>
  <UDashboardPanel id="dashboard-kitchen-team">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Team" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Team roster</h2>
                <UBadge variant="soft" color="neutral">{{ teamCollection.length }}</UBadge>
              </div>
              <p class="text-xs text-dimmed">
                Active chef team for {{ runtimeKitchenName }}.
              </p>
            </div>
          </template>
        </UCard>

        <ProfilesChefCollectionManager
          v-if="teamCollection.length"
          :collection="teamCollection"
        />
        <p v-else class="text-sm text-dimmed">No team members yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import type { ChefCore } from '../../../models/profiles/Chef/Chef.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenName = computed(
  () => String(runtimeKitchen.value?.name || runtimeKitchen.value?.id || 'Kitchen')
)

const teamCollection = computed<Array<ChefCore & { user?: unknown }>>(() =>
  (dummyKitchenScenario.teamMembers ?? []).map((entry) => ({
    ...entry.chef,
    user: entry.user ?? null,
  }))
)
</script>
