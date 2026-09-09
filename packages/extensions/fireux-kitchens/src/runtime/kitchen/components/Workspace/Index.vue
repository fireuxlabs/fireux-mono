<template>
  <p v-if="landingState === 'pending'" role="status" class="py-6 text-muted">
    Loading your Kitchens…
  </p>
  <UAlert
    v-else-if="landingState === 'error' || landingState === 'missing'"
    color="error"
    title="Your Kitchens could not be shown"
    description="Your account has not been changed. Try again before adding another Kitchen."
  />
  <WorkspaceKitchenLandingWelcome
    v-else-if="landingState === 'empty'"
    :can-create="creation.canCreate.value"
    :signed-in="workspace.hasAccount.value"
    :creation-reason="
      intro.tools?.find((tool) => tool.id === 'create')?.reason || ''
    "
    @create="openCreate"
  />
  <WorkspaceCapability
    v-else
    collection-label="Kitchens"
    aria-label="Kitchen workspace"
  >
    <template #collection-panel>
      <WorkspaceKitchenLandingCollection
        :index="index"
        :can-create="creation.canCreate.value"
        @create="openCreate"
      />
    </template>
    <template #selected-panel>
      <WorkspaceKitchenLandingIndividual
        ref="individual"
        :selected="selected"
        :can-update="workspace.outcome.value === 'ready'"
      />
    </template>
  </WorkspaceCapability>
  <WorkspaceKitchenLandingDiscovery :selected="landingState === 'ready'" />
  <WorkspaceKitchenCrudCreate
    v-if="creation.canCreate.value"
    v-model:open="createOpen"
  />
</template>

<script setup lang="ts">
import WorkspaceKitchenLandingCollection from './Landing/Collection.vue'
import WorkspaceKitchenLandingIndividual from './Landing/Individual.vue'
import { computed, ref, watchEffect } from 'vue'
import { navigateTo } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { workspaceLandingState } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import WorkspaceKitchenLandingWelcome from './Landing/Welcome.vue'
import WorkspaceKitchenLandingDiscovery from './Landing/Discovery.vue'
import WorkspaceKitchenCrudCreate from './Crud/Create.vue'
import {
  kitchenLandingDestinations,
  type KitchenLandingIntent,
} from '../../models/landing-intent'
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { kitchenWorkspaceIntro } from '../../utils/kitchen-workspace-intro'

const workspace = useKitchenWorkspace()
const creation = workspace
const index = useKitchenWorkspaceIndex()
const session = useAppSession()
const createOpen = ref(false)
const individual = ref<InstanceType<
  typeof WorkspaceKitchenLandingIndividual
> | null>(null)
const landingState = computed(() =>
  workspaceLandingState({
    outcome: index.outcome.value,
    accountPending: session.pending.value,
    accountError: Boolean(session.error.value),
    associationCount: workspace.allowance.value.used,
    recordCount: index.collection.value.length,
    selectedId: index.selectedId.value,
  })
)
function openCreate() {
  if (workspace.canCreate.value) createOpen.value = true
}
function performAction(intent: KitchenLandingIntent) {
  if (!['ready', 'empty'].includes(landingState.value)) return false
  if (intent.action === 'create' && workspace.canCreate.value) {
    openCreate()
    return true
  } else if (
    intent.action === 'read' &&
    index.collection.value.some((item) => item.id === intent.target)
  ) {
    index.select(intent.target)
    return true
  } else if (
    intent.action === 'update' &&
    workspace.outcome.value === 'ready'
  ) {
    individual.value?.openEdit()
    return Boolean(individual.value)
  } else if (
    intent.action === 'open' &&
    index.selectedId.value &&
    Object.hasOwn(kitchenLandingDestinations, intent.target)
  ) {
    void navigateTo(
      kitchenLandingDestinations[
        intent.target as keyof typeof kitchenLandingDestinations
      ]
    )
    return true
  }
  return false
}
defineExpose({ performAction })
const selected = computed(() =>
  index.collection.value.find((item) => item.id === index.selectedId.value)
)
const pageState = useWorkspacePageState('kitchen')
const intro = computed(() =>
  kitchenWorkspaceIntro({
    status: index.outcome.value,
    count: index.collection.value.length,
    selected: Boolean(selected.value),
    canCreate: workspace.canCreate.value,
    canUpdate: Boolean(selected.value && workspace.outcome.value === 'ready'),
    accountReady: workspace.accountReady.value,
    hasAccount: workspace.hasAccount.value,
    creationEnabled: workspace.creationEnabled.value,
    allowance: workspace.allowance.value,
  })
)
watchEffect(() =>
  pageState.publish({
    intro: intro.value,
    collection: {
      records: index.collection.value.map((item) => ({
        id: item.id,
        name: item.display_name,
        image: item.display_image_url,
      })),
    },
    selected: selected.value
      ? {
          id: selected.value.id,
          name: selected.value.display_name,
          image: selected.value.display_image_url,
          description: selected.value.tagline,
          slug: workspace.data.value?.slug,
          status: workspace.data.value?.status,
          visibility: workspace.data.value?.visibility,
        }
      : null,
    derived: {
      landingState: landingState.value,
      status: index.outcome.value,
      canCreate: creation.canCreate.value,
      allowance: workspace.allowance.value,
      canUpdate: Boolean(selected.value && workspace.outcome.value === 'ready'),
    },
  })
)
</script>
