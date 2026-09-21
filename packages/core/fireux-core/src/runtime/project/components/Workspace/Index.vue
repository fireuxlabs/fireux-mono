<template>
  <WorkspaceProjectHomeGuest v-if="currentUser?.isAnonymous" />
  <template v-else>
    <p v-if="landingState === 'pending'" role="status" class="py-6 text-muted">
      Loading your Projects…
    </p>
    <UAlert
      v-else-if="landingState === 'error' || landingState === 'missing'"
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
          :index="index"
          :can-create="creation.canCreate.value"
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
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { workspaceLandingState } from '../../../composables/fireux/workspace/workspace-outcome'
import WorkspaceCapability from '../../../components/Workspace/Capability.vue'
import type { ProjectLandingIntent } from '../../models/landing-intent'
import type { ProjectPublishedIdentity } from '../../models/published-identity'
import { useWorkspaceCreation } from '../../../composables/fireux/workspace/useWorkspaceCreation'
import { useProjectIdentity } from '../../composables/useProjectIdentity'
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const { currentUser } = useAuth()
import { useWorkspacePageState } from '../../../composables/fireux/workspace/useWorkspacePageState'
import { useAppSession } from '../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from '../../../app/utils/app-subscription-capacity'
import { projectWorkspaceIntro } from '../../utils/project-workspace-intro'

const index = useProjectWorkspaceIndex()
const creation = useWorkspaceCreation('project', () => ({
  count: index.access.ids.value.length,
  outcome: index.access.outcome.value,
}))
const identity = useProjectIdentity({
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
    outcome: index.outcome.value,
    accountPending: session.pending.value,
    accountError: Boolean(session.error.value),
    associationCount: index.access.ids.value.length,
    recordCount: index.collection.value.length,
    selectedId: index.selectedId.value,
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
    index.collection.value.some((item) => item.id === intent.target)
  ) {
    index.select(intent.target)
    return true
  }
  return false
}
defineExpose({ performAction })
const config = useFireUXConfig()
const intro = computed(() => {
  const subscription = session.appUser.value?.subscription || 'free'
  return projectWorkspaceIntro({
    status: index.outcome.value,
    count: index.collection.value.length,
    canCreate: creation.canCreate.value,
    canUpdate: identity.canWrite.value,
    accountReady: !session.pending.value && !session.error.value,
    hasAccount: Boolean(session.uid.value && session.appUser.value),
    configured:
      config.subscriptionCapacity.project?.[subscription] !== undefined,
    subscription,
    used: index.access.ids.value.length,
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
      records: index.collection.value.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image_url,
      })),
    },
    selected: identity.selectedProject.value
      ? {
          id: index.selectedId.value,
          name: identity.name.value,
          image: identity.imageUrl.value,
          description: identity.description.value,
        }
      : null,
    derived: {
      landingState: landingState.value,
      status: index.outcome.value,
      canCreate: creation.canCreate.value,
      canUpdate: identity.canWrite.value,
    },
  })
)
</script>
