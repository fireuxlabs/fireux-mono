<template>
  <WorkspaceProjectHomeGuest v-if="currentUser?.isAnonymous" />
  <template v-else>
    <p v-if="landingState === 'pending'" role="status" class="py-6 text-muted">
      Loading your Projects…
    </p>
    <UAlert
      v-else-if="
        landingState === 'error' ||
        (landingState === 'empty' && workspace.access.ids.value.length > 0)
      "
      color="error"
      title="Your Projects could not be shown"
      description="Your account has not been changed. Try again before creating another Project."
    />
    <WorkspaceProjectHomeWelcome
      v-else-if="landingState === 'empty'"
      :can-create="creation.canCreate.value"
      :signed-in="Boolean(session.uid.value)"
      :creation-reason="
        intro.tools?.find((tool) => tool.id === 'create')?.reason || ''
      "
      @create="openCreate"
    />
    <WorkspaceCapability
      v-else
      collection-label="Projects"
      aria-label="Project workspace"
    >
      <template #collection-panel>
        <WorkspaceProjectHomeCollection
          :workspace="workspace"
          :can-create="creation.canCreate.value"
          :publication="publication"
          @create="openCreate"
        />
      </template>
      <template #single-panel>
        <WorkspaceProjectHomeSingle :identity="identity" />
      </template>
    </WorkspaceCapability>
  </template>
  <WorkspaceProjectHomeDiscovery :selected="landingState === 'ready'" />
  <WorkspaceProjectHomeCreate
    v-if="!currentUser?.isAnonymous && creation.canCreate.value"
    v-model:open="createOpen"
  />
</template>

<script setup lang="ts">
import WorkspaceProjectHomeCollection from './Home/Collection.vue'
import WorkspaceProjectHomeSingle from './Home/Single.vue'
import { computed, ref, watchEffect } from 'vue'
import WorkspaceProjectHomeWelcome from './Home/Welcome.vue'
import WorkspaceProjectHomeDiscovery from './Home/Discovery.vue'
import WorkspaceProjectHomeCreate from './Home/Create.vue'
import WorkspaceProjectHomeGuest from './Home/Guest.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { workspaceLandingState } from 'fireux-core/runtime/workspace/models/outcome'
import WorkspaceCapability from 'fireux-core/runtime/workspace/components/Capability.vue'
import type { ProjectLandingIntent } from '../../models/landing-intent'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
import { useProjectWorkspaceIdentity } from '../../composables/workspace/useProjectWorkspaceIdentity'
import { useProjectWorkspace } from '../../composables/workspace/useProjectWorkspace'

const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const { currentUser } = useAuth()
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { projectWorkspaceIntro } from '../../utils/project-workspace-intro'

const workspace = useProjectWorkspace()
const creation = useWorkspaceCreation('project', () => ({
  count: workspace.access.ids.value.length,
  outcome: workspace.access.outcome.value,
}))
const identity = useProjectWorkspaceIdentity({
  publication: computed(() => props.publication),
})
const pageState = useWorkspacePageState('project')
const session = useAppSession()
const createOpen = ref(false)
function openCreate() {
  if (creation.canCreate.value) createOpen.value = true
}
const landingState = computed(() =>
  workspaceLandingState({
    outcome: workspace.collectionOutcome.value,
    accountPending: session.pending.value,
    accountError: Boolean(session.error.value),
    associationCount: workspace.access.ids.value.length,
    recordCount: workspace.collection.value.length,
    selectedId: workspace.id.value,
  })
)
function performAction(intent: ProjectLandingIntent) {
  if (!['ready', 'empty'].includes(landingState.value)) return false
  if (intent.action === 'create' && creation.canCreate.value) {
    openCreate()
    return true
  }
  if (
    intent.action === 'read' &&
    workspace.collection.value.some((item) => item.id === intent.target)
  ) {
    workspace.select(intent.target)
    return true
  }
  return false
}
defineExpose({ performAction })
const config = useFireUXConfig()
const intro = computed(() => {
  const subscription = session.appUser.value?.subscription || 'free'
  return projectWorkspaceIntro({
    status: workspace.collectionOutcome.value,
    count: workspace.collection.value.length,
    canCreate: creation.canCreate.value,
    canUpdate: identity.canWrite.value,
    accountReady: !session.pending.value && !session.error.value,
    hasAccount: Boolean(session.uid.value && session.appUser.value),
    configured:
      config.subscriptionCapacity.project?.[subscription] !== undefined,
    subscription,
    used: workspace.access.ids.value.length,
    limit: appSubscriptionCapacity(
      config.subscriptionCapacity,
      'project',
      subscription
    ),
    publishedIdentity: Boolean(identity.publication.value),
  })
})
watchEffect(() =>
  pageState.publish({
    intro: intro.value,
    collection: {
      records: workspace.collection.value.map((item) => ({
        id: item.id,
        name: item.identity.name,
        image: item.identity.image_url,
      })),
    },
    selected: identity.selectedProject.value
      ? {
          id: workspace.id.value,
          name: identity.name.value,
          image: identity.imageUrl.value,
          description: identity.description.value,
        }
      : null,
    derived: {
      landingState: landingState.value,
      status: workspace.collectionOutcome.value,
      canCreate: creation.canCreate.value,
      canUpdate: identity.canWrite.value,
    },
  })
)
</script>
