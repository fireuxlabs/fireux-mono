<template>
  <WorkspaceSingleCard
    v-if="identity.selectedProject.value"
    :name="identity.name.value || identity.selectedProject.value.id"
    :description="identity.description.value"
    to="/workspace/project/identity"
  >
    <template #avatar>
      <UAvatar
        :src="identity.imageUrl.value || undefined"
        :alt="identity.name.value"
        icon="i-lucide-briefcase-business"
        size="xl"
      />
    </template>
    <UBadge
      v-if="identity.selectedProject.value.status"
      :color="
        identity.selectedProject.value.status === 'active'
          ? 'success'
          : 'neutral'
      "
      variant="subtle"
      >{{
        identity.selectedProject.value.status === 'active'
          ? 'Active'
          : identity.selectedProject.value.status === 'archived'
            ? 'Archived'
            : 'Inactive'
      }}</UBadge
    >
  </WorkspaceSingleCard>
  <p v-else-if="identity.outcome.value === 'pending'" role="status">
    Loading selected Project…
  </p>
  <UAlert
    v-else-if="identity.outcome.value === 'error'"
    color="error"
    title="Project could not be loaded"
  />
  <p v-else class="text-sm text-muted">Choose a Project from the collection.</p>
</template>
<script setup lang="ts">
import type { useProjectIdentity } from '../../../composables/useProjectIdentity'
defineProps<{ identity: ReturnType<typeof useProjectIdentity> }>()
</script>
