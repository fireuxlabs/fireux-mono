<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <UCard>
      <template #header>
        <div>
          <h2 class="font-semibold">Create Project</h2>
          <p class="text-sm text-muted">
            Create the canonical Project and grant access in the Project
            Console.
          </p>
        </div>
      </template>

      <UForm :state="createForm" class="space-y-4" @submit="submitCreate">
        <UFormField label="Project ID" required>
          <UInput
            v-model="createForm.id"
            placeholder="project-id"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Name" required>
          <UInput
            v-model="createForm.name"
            placeholder="Project name"
            class="w-full"
          />
        </UFormField>
        <UButton type="submit" :loading="pending === 'create'"
          >Create Project</UButton
        >
      </UForm>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <h2 class="font-semibold">Selected Project</h2>
          <p class="text-sm text-muted">
            Update the canonical Project identity or delete an empty Project.
          </p>
        </div>
      </template>

      <div v-if="!projectId" class="text-sm text-muted">
        Select a Project to manage it.
      </div>
      <div v-else class="space-y-6">
        <UForm :state="updateForm" class="space-y-4" @submit="submitUpdate">
          <UFormField label="Name" required>
            <UInput v-model="updateForm.name" class="w-full" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea
              v-model="updateForm.description"
              :rows="4"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Image URL">
            <UInput v-model="updateForm.image_url" type="url" class="w-full" />
          </UFormField>
          <UFormField label="Status">
            <USelect
              v-model="updateForm.status"
              :items="statuses"
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" :loading="pending === 'update'"
            >Save Project</UButton
          >
        </UForm>

        <div class="border-t border-default pt-5">
          <h3 class="font-medium text-error">Delete Project</h3>
          <p class="mt-1 text-sm text-muted">
            Deletion is rejected while an App or Ecosystem references this
            Project.
          </p>
          <UFormField :label="`Type ${projectId} to confirm`" class="mt-3">
            <UInput v-model="deleteConfirmation" class="w-full" />
          </UFormField>
          <UButton
            class="mt-3"
            color="error"
            variant="soft"
            :disabled="deleteConfirmation !== projectId"
            :loading="pending === 'delete'"
            @click="submitDelete"
          >
            Delete Project
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { refreshNuxtData } from '#imports'
import { reactive, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/console/project/core/useProjectConsole'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

type Action = 'create' | 'update' | 'delete'
type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'

const statuses: ProjectStatus[] = ['draft', 'active', 'paused', 'archived']
const toast = useToast()
const { currentUser } = useAuth()
const { selection, actions } = useProjectConsole()
const projectId = selection.projectId
const pending = ref<Action | null>(null)
const deleteConfirmation = ref('')
const createForm = reactive({ id: '', name: '' })
const updateForm = reactive({
  name: '',
  description: '',
  image_url: '',
  status: 'draft' as ProjectStatus,
})

watch(
  selection.project,
  (project: ProjectSurface | null) => {
    updateForm.name = String(project?.name || '')
    updateForm.description = String(project?.description || '')
    updateForm.image_url = String(project?.image_url || '')
    updateForm.status = statuses.includes(project?.status as ProjectStatus)
      ? (project?.status as ProjectStatus)
      : 'draft'
    deleteConfirmation.value = ''
  },
  { immediate: true }
)

async function headers() {
  const user = currentUser.value
  if (!user) throw new Error('Sign in to manage Projects.')
  return { authorization: `Bearer ${await user.getIdToken()}` }
}

function message(error: unknown) {
  if (error && typeof error === 'object') {
    const data = 'data' in error ? error.data : null
    if (data && typeof data === 'object' && 'statusMessage' in data) {
      return String(data.statusMessage)
    }
  }
  return error instanceof Error ? error.message : 'Project operation failed.'
}

async function run(action: Action, work: () => Promise<void>) {
  pending.value = action
  try {
    await work()
  } catch (error) {
    toast.add({
      title: 'Project operation failed',
      description: message(error),
      color: 'error',
    })
  } finally {
    pending.value = null
  }
}

function submitCreate() {
  return run('create', async () => {
    const result = await $fetch<{ project_id: string }>(
      '/api/internal/control/projects',
      {
        method: 'POST',
        headers: await headers(),
        body: createForm,
      }
    )
    await refreshNuxtData()
    actions.selectProject(result.project_id)
    createForm.id = ''
    createForm.name = ''
    toast.add({ title: 'Project created' })
  })
}

function submitUpdate() {
  return run('update', async () => {
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(projectId.value)}`,
      {
        method: 'PATCH',
        headers: await headers(),
        body: updateForm,
      }
    )
    await refreshNuxtData()
    toast.add({ title: 'Project saved' })
  })
}

function submitDelete() {
  if (!projectId.value || deleteConfirmation.value !== projectId.value) return
  return run('delete', async () => {
    await $fetch(
      `/api/internal/control/projects/${encodeURIComponent(projectId.value)}`,
      {
        method: 'DELETE',
        headers: await headers(),
      }
    )
    actions.clearSelectedProject()
    await refreshNuxtData()
    toast.add({ title: 'Project deleted' })
  })
}
</script>
