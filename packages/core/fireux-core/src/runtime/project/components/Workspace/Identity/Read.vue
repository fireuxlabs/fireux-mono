<template>
  <USkeleton v-if="outcome === 'pending'" class="h-64 rounded-2xl" />
  <UAlert v-else-if="outcome === 'error'" color="error" title="Project identity unavailable" description="The selected Project could not be loaded." />
  <UAlert v-else-if="!selectedProject" title="No Project selected" />
  <div v-else class="grid gap-5 xl:grid-cols-2">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
        <UAvatar :src="imageUrl || undefined" :alt="name || 'Project'" icon="i-lucide-folder" size="3xl" class="rounded-2xl" style="width: 6rem; height: 6rem; flex: 0 0 6rem; align-self: flex-start" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">Project identity</p>
          <h2 class="mt-2 break-words text-3xl font-semibold tracking-tight text-highlighted">{{ name || 'Untitled project' }}</h2>
          <p class="mt-4 whitespace-pre-line text-base leading-7 text-muted">{{ description || 'Add a description to tell the story of this project.' }}</p>
          <UBadge class="mt-5" color="neutral" variant="subtle">{{ identity.publication.value ? 'Connected App' : 'Project-owned identity' }}</UBadge>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm text-muted">{{ identity.publication.value ? 'Edit the name here. The App publishes its description and image.' : 'Keep your name, description and image up to date.' }}</span>
          <slot name="actions" />
        </div>
      </template>
    </UCard>
    <UCard>
      <div class="flex items-center gap-3">
        <UIcon :name="identity.publication.value ? 'i-lucide-link' : 'i-lucide-fingerprint'" class="size-5 text-primary" />
        <h2 class="font-semibold">{{ identity.publication.value ? 'Published by your App' : 'Identity source' }}</h2>
      </div>
      <template v-if="identity.publication.value">
        <p class="mt-5 text-lg font-medium">{{ identity.publication.value.appName }}</p>
        <p class="mt-2 text-sm leading-6 text-muted">Description and imagery stay connected to the App’s published identity.</p>
        <p v-if="identity.publication.value.status === 'pending'" class="mt-4 text-sm" role="status">Loading App identity…</p>
        <div v-if="identity.publication.value.message" class="mt-4">
          <p role="status" class="text-sm">{{ identity.publication.value.message }}</p>
          <MoleculesCopyError :message="identity.publication.value.message" />
        </div>
        <UButton class="mt-5" :to="identity.publication.value.sourceUrl" target="_blank" label="View published source" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="soft" />
      </template>
      <p v-else class="mt-5 text-sm leading-6 text-muted">This Project owns its name, description and image. Update them together in the Identity editor.</p>
    </UCard>
  </div>
</template>
<script setup lang="ts">
import type { ProjectIdentityState } from '../../../composables/useProjectIdentity'
const props = defineProps<{ identity: ProjectIdentityState }>()
const { selectedProject, outcome, name, description, imageUrl } = props.identity
</script>
