<template>
  <WorkspaceKitchenHomeGuest v-if="currentUser?.isAnonymous" />
  <UAlert
    v-else-if="adoption.error.value"
    color="error"
    :title="adoption.error.value"
  >
    <template #actions
      ><UButton
        label="Try again"
        @click="adoption.adopt()" /><FireCopyError
        :message="adoption.error.value"
    /></template>
  </UAlert>
  <p v-else-if="adoption.pending.value" role="status">
    Connecting your Kitchen…
  </p>
  <p
    v-else-if="landingState === 'pending'"
    role="status"
    class="py-6 text-muted"
  >
    Loading your Kitchens…
  </p>
  <UAlert
    v-else-if="landingState === 'error' || landingState === 'missing'"
    color="error"
    title="Your Kitchens could not be shown"
    description="Your account has not been changed. Try again before adding another Kitchen."
  />
  <WorkspaceKitchenHomeAccess
    v-else-if="landingState === 'empty' && dedicatedAppName"
    :app-name="dedicatedAppName"
  />
  <WorkspaceKitchenHomeWelcome
    v-else-if="landingState === 'empty'"
    :can-create="creation.canCreate.value"
    :signed-in="creation.hasAccount.value"
    :creation-reason="
      intro.tools?.find((tool) => tool.id === 'create')?.reason || ''
    "
    @create="openCreate"
  />
  <WorkspaceKitchenHomeSingle
    v-else
    ref="single"
    :selected="selected"
    :can-update="workspace.outcome.value === 'ready'"
  />
  <WorkspaceKitchenHomeCreate
    v-if="creation.canCreate.value"
    v-model:open="createOpen"
  />
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type WorkspaceKitchenHomeSingle from './Home/Single.vue'
import { computed, ref, watchEffect } from 'vue'
import { navigateTo } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { workspaceLandingState } from 'fireux-core/runtime/workspace/models/outcome'
import {
  kitchenLandingDestinations,
  type KitchenLandingIntent,
} from '../../models/landing-intent'
import { useKitchenCreate } from '../../composables/firestore/useKitchenCreate'
import { useKitchenAnonymousAdoption } from '../../composables/workspace/useKitchenAnonymousAdoption'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'

import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { kitchenWorkspaceIntro } from '../../utils/kitchen-workspace-intro'

defineProps<{ dedicatedAppName?: string }>()

const { currentUser } = useAuth()
const creation = useKitchenCreate()
const adoption = useKitchenAnonymousAdoption()
const workspace = useKitchenWorkspace()
const session = useAppSession()
const createOpen = ref(false)
const single = ref<InstanceType<typeof WorkspaceKitchenHomeSingle> | null>(null)
const landingState = computed(() =>
  workspaceLandingState({
    outcome: workspace.collectionOutcome.value,
    accountPending: session.pending.value,
    accountError: Boolean(session.error.value),
    associationCount: creation.allowance.value.used,
    recordCount: workspace.collection.value.length,
    selectedId: workspace.id.value,
  })
)
function openCreate() {
  if (creation.canCreate.value) createOpen.value = true
}
function performAction(intent: KitchenLandingIntent) {
  if (!['ready', 'empty'].includes(landingState.value)) return false
  if (intent.action === 'create' && creation.canCreate.value) {
    openCreate()
    return true
  } else if (
    intent.action === 'read' &&
    (workspace.multipleKitchenView.value ||
      intent.target === workspace.id.value) &&
    workspace.collection.value.some((item) => item.id === intent.target)
  ) {
    workspace.select(intent.target)
    return true
  } else if (
    intent.action === 'update' &&
    workspace.outcome.value === 'ready'
  ) {
    single.value?.openEdit()
    return Boolean(single.value)
  } else if (
    intent.action === 'open' &&
    workspace.id.value &&
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
  workspace.collection.value.find((item) => item.id === workspace.id.value)
)
const pageState = useWorkspacePageState('kitchen')
const intro = computed(() =>
  kitchenWorkspaceIntro({
    status: workspace.collectionOutcome.value,
    count: workspace.collection.value.length,
    selected: Boolean(selected.value),
    canCreate: creation.canCreate.value,
    canUpdate: Boolean(selected.value && workspace.outcome.value === 'ready'),
    creationEnabled: creation.creationEnabled.value,
    accountReady: creation.accountReady.value,
    hasAccount: creation.hasAccount.value,
    allowance: creation.allowance.value,
  })
)
watchEffect(() =>
  pageState.publish({
    intro: intro.value,
    collection: {
      records: workspace.collection.value
        .filter(
          (item) =>
            workspace.multipleKitchenView.value ||
            item.id === workspace.id.value
        )
        .map((item) => ({
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
      status: workspace.collectionOutcome.value,
      multipleKitchenView: workspace.multipleKitchenView.value,
      canCreate: creation.canCreate.value,
      allowance: creation.allowance.value,
      canUpdate: Boolean(selected.value && workspace.outcome.value === 'ready'),
    },
  })
)
</script>
