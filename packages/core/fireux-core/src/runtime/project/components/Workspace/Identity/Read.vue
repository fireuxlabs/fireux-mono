<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="workspace-card-header">
          <div class="workspace-card-header__title">Identity</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="workspace-card-header__description">
          Root-facing project information for the selected project.
        </p>

        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Name:
            <span class="workspace-summary-value">{{ name || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Description:
            <span class="workspace-summary-value">{{ description || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Image:
            <span class="workspace-summary-value">{{ imageUrl || 'Unset' }}</span>
          </div>
        </div>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
import { useProjectWorkspaceIdentity } from '../../../composables/workspace/identity/useProjectWorkspaceIdentity'

const { selectedProject, name, description, imageUrl } =
  useProjectWorkspaceIdentity()
</script>
