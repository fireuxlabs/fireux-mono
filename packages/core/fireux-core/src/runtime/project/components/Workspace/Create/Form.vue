<template>
  <form class="grid gap-3" @submit.prevent="submit">
    <UInput
      v-model="name"
      name="project-name"
      placeholder="Project name"
      maxlength="120"
      :disabled="pending"
    />
    <UButton
      type="submit"
      icon="i-lucide-plus"
      :loading="pending"
      label="Create Project"
    />
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Project creation failed"
      :description="error"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectWorkspaceCreate } from '../../../composables/workspace/index/useProjectWorkspaceCreate'

const emit = defineEmits<{
  (event: 'created'): void
}>()
const name = ref('')
const { createProject, pending, error } = useProjectWorkspaceCreate()

async function submit() {
  const response = await createProject(name.value).catch(() => null)
  if (!response) return
  name.value = ''
  emit('created')
}
</script>
