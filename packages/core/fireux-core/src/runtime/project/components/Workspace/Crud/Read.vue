<template>
  <UModal
    :open="open"
    title="Read Projects"
    description="Choose a Project to open its detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="project in projects"
          :key="project.id"
          :to="`/workspace/project/${encodeURIComponent(project.id)}`"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        >
          <UAvatar
            :src="project.image_url || undefined"
            :alt="project.name"
            icon="i-lucide-briefcase-business"
            size="md"
          />
          <span class="min-w-0 text-left">
            <span class="block truncate font-medium">{{ project.name }}</span>
            <span
              v-if="project.description"
              class="block truncate text-xs text-muted"
            >
              {{ project.description }}
            </span>
          </span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectWorkspaceIndex } from '../../../composables/workspace/index/useProjectWorkspaceIndex'
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const workspaceIndex = useProjectWorkspaceIndex()
const projects = computed(() => {
  return workspaceIndex.collection.value
})
</script>
