<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="La Tap Berne Kitchen Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">
              {{ runtime.mode === 'read-only' ? 'All read-only kitchens' : 'All owned kitchens' }}
            </span>
            <template v-if="activeKitchen">
              · Active kitchen:
              <span class="font-mono">{{ activeKitchen.id }}</span>
            </template>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ mode }}</span>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ isOperatorOverview
                ? runtime.mode === 'read-only' ? 'All read-only kitchens' : 'All owned kitchens'
                : 'Kitchen runtime' }}
            </div>
          </template>

          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="isOperatorOverview">
          <template #header>
            <div class="text-sm font-semibold">
              {{ runtime.mode === 'read-only' ? 'Read-only kitchens' : 'Owned kitchens' }}
            </div>
          </template>

          <div class="space-y-3">
            <div v-if="availableKitchenPills.length" class="space-y-2">
              <KitchenCardsPill
                v-for="item in availableKitchenPills"
                :key="item.id"
                v-bind="item"
                :link="false"
                :action="true"
                :show-badges="false"
                class="cursor-pointer"
                @action="selectKitchen(item.id)"
              />
            </div>

            <p class="text-sm text-dimmed">
              Overview totals above include all {{ runtime.mode === 'read-only' ? 'read-only' : 'owned' }} kitchens. Select one here when you want Menu, Team, or Suppliers routes to work against a specific kitchen.
            </p>

            <UAlert
              v-if="!hasActiveKitchen"
              color="neutral"
              variant="soft"
              title="Select a kitchen for workspace routes"
              :description="`Choose one ${runtime.mode === 'read-only' ? 'read-only' : 'owned'} kitchen above before opening deeper console routes.`"
            />
            <UAlert
              v-else-if="activeKitchenPill"
              color="primary"
              variant="soft"
              title="Active kitchen selected"
              :description="`${activeKitchenPill.title}${activeKitchenPill.subtitle ? ` · ${activeKitchenPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <UAlert
            v-if="isOperatorOverview && !hasActiveKitchen"
            color="neutral"
            variant="soft"
            title="Pick an active kitchen first"
            :description="`The overview is showing all ${runtime.mode === 'read-only' ? 'read-only' : 'owned'} kitchens. Select one above to enable Menu, Team, and Suppliers routes.`"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in surfaceLinks"
              :key="link.key"
              :to="link.to"
              variant="soft"
              :icon="link.icon"
              block
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useRuntimeKitchenConsole } from 'fireux-kitchens/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'
import KitchenCardsPill from 'fireux-kitchens/runtime/components/organisms/Kitchen/Cards/Pill.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-chef-hat',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  overview,
  surfaceLinks,
  ownedKitchens,
  ownedKitchenPills,
  readOnlyScenarios,
  readOnlyKitchenPills,
  activeKitchen,
  activeKitchenPill,
  hasActiveKitchen,
  isOperatorOverview,
  ownershipPending,
  setActiveOwnedKitchen,
} = useRuntimeKitchenConsole()

const mode = runtime.mode
const availableKitchenPills = computed(() =>
  runtime.mode.value === 'read-only' ? readOnlyKitchenPills.value : ownedKitchenPills.value
)

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedKitchens.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String((ownedKitchens.value[0] as any)?.id || '')),
  singleReadOnlyId: computed(() => String((readOnlyScenarios.value[0]?.kitchen as any)?.id || '')),
  setActiveTarget: setActiveOwnedKitchen,
  createPath: '/console/kitchen/create',
  overviewPath: '/console/kitchen/overview',
})

await ensureOverviewEntry()

const selectKitchen = (kitchenId: string) => {
  setActiveOwnedKitchen(kitchenId)
}
</script>
