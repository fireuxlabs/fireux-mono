<template>
  <USkeleton v-if="outcome === 'pending'" class="h-48" />
  <FireStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Project unavailable"
    description="The selected Project could not be loaded."
  />
  <FireStateCard
    v-else-if="!data"
    state="empty"
    title="No Project selected"
    description="Choose a workspace to see its overview."
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
      <p class="text-sm text-muted">Complete your Project identity.</p>
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
import { useProjectWorkspaceHome } from '../../../composables/workspace/useProjectWorkspaceHome'
const { selectedProject: data, outcome } = useProjectWorkspaceHome()
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
