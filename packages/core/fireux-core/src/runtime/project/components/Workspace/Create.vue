<template>
  <UCard variant="subtle">
    <template #header>
      <div>
        <p class="font-semibold text-highlighted">Create your first Project</p>
        <p class="mt-1 text-sm text-muted">
          Start with an empty Project shell. Apps and capabilities are added in
          later reviewed steps.
        </p>
      </div>
    </template>

    <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
      <UInput
        v-model="name"
        name="project-name"
        placeholder="Project name"
        maxlength="120"
        class="min-w-0 flex-1"
        :disabled="pending"
      />
      <UButton type="submit" icon="i-lucide-plus" :loading="pending">
        Create Project
      </UButton>
    </form>

    <UAlert
      v-if="error"
      class="mt-3"
      color="error"
      variant="soft"
      title="Project creation failed"
      :description="error"
    />
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectWorkspaceCreate } from '../../composables/workspace/index/useProjectWorkspaceCreate'

const name = ref('')
const { createProject, pending, error } = useProjectWorkspaceCreate()

async function submit() {
  const response = await createProject(name.value).catch(() => null)
  if (response) name.value = ''
}
</script>
