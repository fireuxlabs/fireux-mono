<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Misebox Kitchen Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
            <template v-if="activeKitchen">
              · Active kitchen:
              <span class="font-mono">{{ activeKitchen.id }}</span>
            </template>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            · Kitchen: <span class="font-mono">{{ runtime.id }}</span>
          </template>
        </div>

        <UAlert color="primary" variant="soft" title="Hello world" />

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">{{ isOperatorOverview ? scopeLabel : singleOverviewTitle }}</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <div class="text-sm font-semibold">{{ targetListTitle }}</div>
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

            <p class="text-sm text-dimmed">{{ selectionHelp }}</p>

            <UAlert
              v-if="!hasActiveKitchen"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />
            <UAlert
              v-else-if="activeKitchenPill"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
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
            :title="quickActionsTitle"
            :description="quickActionsDescription"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in actionLinks"
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

        <DevJson
          v-if="isDev"
          title="Kitchen Runtime (JSON)"
          context="projects/misebox/misebox-app · /console/kitchen/overview"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useConsoleOverviewLabels } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewLabels'
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

const {
  scopeLabel,
  targetListTitle,
  selectionTitle,
  selectionDescription,
  selectionHelp,
  activeSelectionTitle,
  quickActionsTitle,
  quickActionsDescription,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'kitchen',
  plural: 'kitchens',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const actionLinks = computed(() => surfaceLinks.value)
const availableKitchenPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyKitchenPills.value : ownedKitchenPills.value
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

const runtimeSnapshot = computed(() => {
  const data = runtime.data.value
  return {
    id: runtime.id.value,
    mode: runtime.mode.value,
    isReadOnly: runtime.isReadOnly.value,
    documentCollectionPath: runtime.documentCollectionPath.value,
    collectionPath: runtime.collectionPath.value,
    pending: runtime.pending.value,
    isLoading: runtime.isLoading.value,
    isReady: runtime.isReady.value,
    doc: runtime.doc.value,
    data,
    overview: overview.value,
    actionLinks: actionLinks.value,
    ownedKitchens: ownedKitchens.value,
    readOnlyScenarios: readOnlyScenarios.value,
    isOperatorOverview: isOperatorOverview.value,
    hasActiveKitchen: hasActiveKitchen.value,
  }
})
</script>
