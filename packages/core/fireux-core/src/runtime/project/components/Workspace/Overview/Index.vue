<template>
  <USkeleton v-if="outcome === 'pending'" class="h-48" />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Project unavailable"
    description="The selected Project could not be loaded."
  />
  <MoleculesStateCard
    v-else-if="!data"
    state="missing"
    title="No Project selected"
    description="Choose a workspace to see its overview."
  />
  <WorkspaceOverview
    v-else
    :title="data.name || 'Untitled Project'"
    label="Project overview"
    :description="data.description"
    :image="data.image_url"
    icon="i-lucide-briefcase-business"
    :links="links"
  >
    <slot />
    <template v-if="missing.length" #attention>
      <p class="text-sm text-muted">Complete your Project identity.</p>
      <UButton
        v-for="field in missing"
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
import { computed } from 'vue'
import WorkspaceOverview from '../../../../components/Workspace/Overview.vue'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'
const { data, outcome } = useProjectWorkspace()
const missing = computed(() =>
  [
    !data.value?.name && 'a name',
    !data.value?.description && 'a description',
    !data.value?.image_url && 'an image',
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
