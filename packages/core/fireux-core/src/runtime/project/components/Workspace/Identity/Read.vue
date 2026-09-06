<template>
  <div class="space-y-6">
    <USkeleton v-if="outcome === 'pending'" class="h-40" />
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Project identity unavailable"
      description="The selected Project could not be loaded."
    />
    <UAlert v-else-if="!selectedProject" title="No Project selected" />
    <UCard v-else>
      <template #header>
        <div class="workspace-card-header">
          <div class="workspace-card-header__title">Identity</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="workspace-card-header__description">
          The selected Project’s name, description, and image.
        </p>

        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Name:
            <span class="workspace-summary-value">{{ name || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Description:
            <span class="workspace-summary-value">{{
              description || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Image:
            <UAvatar
              v-if="imageUrl"
              :src="imageUrl"
              :alt="name || 'Project'"
              size="xl"
            /><span v-else class="workspace-summary-value">Unset</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ProjectWorkspaceIdentityState } from '../../../composables/workspace/identity/useProjectWorkspaceIdentity'
const props = defineProps<{ identity: ProjectWorkspaceIdentityState }>()
const { selectedProject, outcome, name, description, imageUrl } = props.identity
</script>
