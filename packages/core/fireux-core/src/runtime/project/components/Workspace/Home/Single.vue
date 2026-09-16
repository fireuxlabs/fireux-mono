<template>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-semibold">
      {{ identity.name.value || 'Choose a Project' }}
    </h2>
    <UButton
      label="Edit Project"
      icon="i-lucide-pencil"
      color="neutral"
      variant="soft"
      :disabled="!identity.canWrite.value"
      @click="editOpen = true"
    />
    <WorkspaceProjectIdentityWrite
      :identity="identity"
      :requested-open="editOpen"
      @close="editOpen = false"
    />
  </header>
  <UCard v-if="identity.selectedProject.value">
    <div class="space-y-3">
      <UAvatar
        :src="identity.imageUrl.value || undefined"
        :alt="identity.name.value"
        icon="i-lucide-briefcase-business"
        size="xl"
      />
      <h3 class="font-medium">
        {{ identity.name.value || identity.selectedProject.value?.id }}
      </h3>
      <p v-if="identity.description.value" class="text-sm text-muted">
        {{ identity.description.value }}
      </p>
      <UButton
        to="/workspace/project/identity"
        label="Open identity"
        variant="link"
      />
    </div>
  </UCard>
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
import { ref } from 'vue'
import type { useProjectIdentity } from '../../../composables/useProjectIdentity'
import WorkspaceProjectIdentityWrite from '../Identity/Write.vue'

defineProps<{
  identity: ReturnType<typeof useProjectIdentity>
}>()
const editOpen = ref(false)
</script>
