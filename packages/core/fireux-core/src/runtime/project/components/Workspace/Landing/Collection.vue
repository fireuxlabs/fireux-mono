<template>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-semibold">Projects</h2>
    <UButton
      label="Create Project"
      icon="i-lucide-plus"
      :disabled="!canCreate"
      @click="emit('create')"
    />
  </header>
  <p v-if="index.outcome.value === 'pending'" role="status">
    Loading Projects…
  </p>
  <UAlert
    v-else-if="index.outcome.value === 'error'"
    color="error"
    title="Projects could not be loaded"
  />
  <div v-else-if="index.collection.value.length" class="grid gap-2">
    <UButton
      v-for="project in index.collection.value"
      :key="project.id"
      color="neutral"
      :variant="project.id === index.selectedId.value ? 'soft' : 'ghost'"
      class="justify-start"
      :aria-pressed="project.id === index.selectedId.value"
      @click="select(project.id)"
    >
      <UAvatar
        :src="project.image_url || undefined"
        :alt="project.name"
        icon="i-lucide-briefcase-business"
      />
      <span class="truncate">{{ project.name || project.id }}</span>
    </UButton>
  </div>
  <p v-else class="text-sm text-muted">Create a Project to get started.</p>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { useProjectWorkspaceIndex } from '../../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  index: ReturnType<typeof useProjectWorkspaceIndex>
  canCreate: boolean
  openOnSelect?: boolean
}>()
const emit = defineEmits<{ create: [] }>()
function select(id: string) {
  props.index.select(id)
  if (props.openOnSelect) void navigateTo('/')
}
</script>
