<template>
  <FireState v-if="outcome === 'pending'" outcome="pending" />
  <UAlert
    v-else-if="outcome === 'error'"
    title="Project unavailable"
    description="The selected Project could not be loaded."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="Project unavailable&#10;The selected Project could not be loaded."
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!data"
    title="No Project selected"
    description="Choose a workspace to see its overview."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
  />
  <WorkspaceOverview
    v-else
    :title="data.identity.name || 'Untitled Project'"
    label="Project overview"
    :description="data.identity.description"
    :image="data.identity.image_url"
    icon="i-lucide-briefcase-business"
    :links="links"
  >
    <OverviewCapabilities />
    <template v-if="incompleteFields.length" #attention>
      <p>Complete your Project identity.</p>
      <UButton
        v-for="field in incompleteFields"
        :key="field"
        to="/workspace/project/identity"
        :label="`Add ${field}`"
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
import { computed } from 'vue'
import WorkspaceOverview from 'fireux-core/runtime/workspace/components/Overview/Index.vue'
import { useProjectWorkspace } from '../../../composables/workspace/useProjectWorkspace'
const { data, outcome } = useProjectWorkspace()
const incompleteFields = computed(() =>
  [
    !data.value?.identity.name && 'a name',
    !data.value?.identity.description && 'a description',
    !data.value?.identity.image_url && 'an image',
  ].filter((field): field is string => Boolean(field))
)
const links = [
  {
    label: 'Identity',
    to: '/workspace/project/identity',
    icon: 'i-lucide-info',
  },
  { label: 'Team', to: '/workspace/project/team', icon: 'i-lucide-users' },
  {
    label: 'Calendar',
    to: '/workspace/project/calendar',
    icon: 'i-lucide-calendar',
  },
]
</script>
