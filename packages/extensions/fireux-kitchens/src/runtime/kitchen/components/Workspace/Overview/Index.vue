<template>
  <USkeleton v-if="targetOutcome === 'pending'" class="h-48" />
  <MoleculesStateCard
    v-else-if="targetOutcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="The selected kitchen could not be loaded."
  />
  <MoleculesStateCard
    v-else-if="!selectedKitchen"
    state="missing"
    title="No kitchen selected"
    description="Choose a kitchen to see its overview."
  />
  <WorkspaceOverview
    v-else
    :title="kitchenTitle"
    :description="kitchenSubtitle"
    :image="identityImage"
    icon="i-lucide-chef-hat"
    :links="links"
  >
    <template #badge
      ><UBadge :color="visibilityBadgeColor" variant="soft">{{
        visibilityBadgeLabel
      }}</UBadge></template
    >
    <OverviewCapabilities />
    <MoleculesStateCard
      v-if="placeOutcome === 'error'"
      state="error"
      title="Kitchen details unavailable"
      description="The linked Place could not be loaded. Refresh the page to try again."
      surface="bare"
    />
    <UCard v-else-if="detailItems.length">
      <template #header
        ><h2 class="font-semibold">Kitchen details</h2></template
      >
      <dl class="grid gap-5 sm:grid-cols-2">
        <div v-for="item in detailItems" :key="item.key">
          <dt class="flex items-center gap-2 text-sm text-muted">
            <UIcon :name="item.icon" />{{ item.label }}
          </dt>
          <dd class="mt-1 break-words text-sm text-highlighted">
            {{ item.value }}
          </dd>
        </div>
      </dl>
    </UCard>
    <template v-if="missingIdentityFields.length" #attention>
      <p class="text-sm text-muted">Complete your kitchen identity.</p>
      <UButton
        v-for="field in missingIdentityFields"
        :key="field.key"
        :to="field.to"
        :label="`Add ${field.label.toLowerCase()}`"
        icon="i-lucide-arrow-right"
        color="neutral"
        variant="soft"
        block
      />
    </template>
  </WorkspaceOverview>
</template>
<script setup lang="ts">
import OverviewCapabilities from './Capabilities.vue'
import { watchEffect } from 'vue'
import type { WorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import WorkspaceOverview from 'fireux-core/runtime/components/Workspace/Overview/Index.vue'
import { useKitchenOverview } from '../../../composables/workspace/overview/useKitchenOverview'
const {
  pageState,
  placeOutcome,
  selectedKitchen,
  targetOutcome,
  kitchenTitle,
  kitchenSubtitle,
  identityImage,
  detailItems,
  visibilityBadgeLabel,
  visibilityBadgeColor,
  missingIdentityFields,
} = useKitchenOverview()
const emit = defineEmits<{ state: [value: WorkspacePageState] }>()
watchEffect(() => emit('state', pageState.value))
const links = [
  {
    label: 'Identity',
    to: '/workspace/kitchen/identity',
    icon: 'i-lucide-info',
  },
  { label: 'Team', to: '/workspace/kitchen/team', icon: 'i-lucide-users' },
  {
    label: 'Calendar',
    to: '/workspace/kitchen/calendar',
    icon: 'i-lucide-calendar',
  },
]
</script>
