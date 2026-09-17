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
    :description="description"
    :image="imageUrl"
    icon="i-lucide-briefcase-business"
    :links="links"
  >
    <div v-if="publication" class="space-y-2 text-sm text-muted">
      <UButton
        :to="publication.sourceUrl"
        target="_blank"
        :label="`Description and image from ${publication.appName}`"
        variant="link"
      />
      <p v-if="publication.status === 'pending'">Loading App identity…</p>
      <template v-if="publication.message"
        ><p>{{ publication.message }}</p>
        <MoleculesCopyError :message="publication.message"
      /></template>
    </div>
    <OverviewCapabilities :publication="publication" />
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
import OverviewCapabilities from './Capabilities.vue'
import { computed } from 'vue'
import type { ProjectPublishedIdentity } from '../../../models/published-identity'
import WorkspaceOverview from '../../../../components/Workspace/Overview/Index.vue'
import { useProjectOverview } from '../../../composables/useProjectOverview'
const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const { selectedProject: data, outcome } = useProjectOverview()
const description = computed(() =>
  props.publication
    ? props.publication.description
    : data.value?.description || ''
)
const imageUrl = computed(() =>
  props.publication ? props.publication.imageUrl : data.value?.image_url || ''
)
const missing = computed(() =>
  [
    !data.value?.name && 'a name',
    !props.publication && !data.value?.description && 'a description',
    !props.publication && !data.value?.image_url && 'an image',
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
