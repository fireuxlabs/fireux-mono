<template>
  <form class="grid gap-3" @submit.prevent="submit">
    <UFormField label="Project name">
      <UInput
        v-model="name"
        name="project-name"
        placeholder="Project name"
        maxlength="120"
        :disabled="pending"
      />
    </UFormField>
    <UButton
      type="submit"
      icon="i-lucide-plus"
      :loading="pending"
      label="Create Project"
    />
    <UAlert
      v-if="formError || error"
      color="error"
      variant="soft"
      title="Project creation failed"
      :description="formError || error"
    />
    <MoleculesCopyError
      v-if="formError || error"
      :message="formError || error"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectWorkspaceCreate } from '../../../composables/workspace/useProjectWorkspaceCreate'

const emit = defineEmits<{
  (event: 'created'): void
}>()
const name = ref('')
const formError = ref('')
const { createProject, pending, error } = useProjectWorkspaceCreate()

async function submit() {
  if (pending.value) return
  formError.value = ''
  const response = await createProject(name.value).catch((cause: unknown) => {
    formError.value =
      cause instanceof Error ? cause.message : 'Project creation failed.'
    return null
  })
  if (!response) return
  name.value = ''
  emit('created')
}
</script>
