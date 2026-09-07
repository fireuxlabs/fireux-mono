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
          {{
            identity.publication.value
              ? 'Workspace name with description and image published by the connected App.'
              : 'The selected Project’s name, description, and image.'
          }}
        </p>

        <div v-if="identity.publication.value" class="space-y-2">
          <UButton
            :to="identity.publication.value.sourceUrl"
            target="_blank"
            :label="`Published by ${identity.publication.value.appName}`"
            variant="link"
          />
          <p v-if="identity.publication.value.status === 'pending'">
            Loading App identity…
          </p>
          <template v-if="identity.publication.value.message">
            <p role="status">{{ identity.publication.value.message }}</p>
            <MoleculesCopyError :message="identity.publication.value.message" />
          </template>
        </div>
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
import type { ProjectIdentityState } from '../../../composables/useProjectIdentity'
const props = defineProps<{ identity: ProjectIdentityState }>()
const { selectedProject, outcome, name, description, imageUrl } = props.identity
</script>
