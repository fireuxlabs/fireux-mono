<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            <template v-if="runtime.id">
              · Active kitchen:
              <span class="font-mono">{{ runtime.id }}</span>
            </template>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ isOperatorOverview ? targetListTitle : singleOverviewTitle }}
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-dimmed">{{ selectionHelpText }}</p>

            <div v-if="showSelector && availableKitchenPills.length" class="space-y-2">
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

            <UAlert
              v-if="isOperatorOverview && !hasActiveKitchen"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />

            <UAlert
              v-else-if="activeSelectionDescription"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="activeSelectionDescription"
            />
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Kitchen Runtime (JSON)"
          context="console/kitchen/overview · runtime snapshot"
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
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'

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
  ownedKitchens,
  ownedKitchenPills,
  readOnlyScenarios,
  readOnlyKitchenPills,
  activeKitchenPill,
  hasActiveKitchen,
  canSelectMultipleLive,
  showSelector,
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
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'kitchen',
  plural: 'kitchens',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const availableKitchenPills = computed(() =>
  runtime.isReadOnly.value ? readOnlyKitchenPills.value : ownedKitchenPills.value
)
const selectionHelpText = computed(() => {
  if (isOperatorOverview.value) return selectionHelp.value
  if (showSelector.value) {
    return 'This console is scoped to one active kitchen. Switch the active kitchen here any time.'
  }
  return 'This console is running as a single-kitchen workspace.'
})
const activeSelectionDescription = computed(() => {
  if (activeKitchenPill.value) {
    return `${activeKitchenPill.value.title}${
      activeKitchenPill.value.subtitle ? ` · ${activeKitchenPill.value.subtitle}` : ''
    }`
  }
  return String(runtime.id.value || '').trim()
})

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedKitchens.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String((ownedKitchens.value[0] as any)?.id || '')),
  singleReadOnlyId: computed(() => String((readOnlyScenarios.value[0]?.kitchen as any)?.id || '')),
  allowMultiLiveSelection: canSelectMultipleLive,
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
    ownedKitchens: ownedKitchens.value,
    readOnlyScenarios: readOnlyScenarios.value,
    canSelectMultipleLive: canSelectMultipleLive.value,
    showSelector: showSelector.value,
    isOperatorOverview: isOperatorOverview.value,
    hasActiveKitchen: hasActiveKitchen.value,
  }
})
</script>
