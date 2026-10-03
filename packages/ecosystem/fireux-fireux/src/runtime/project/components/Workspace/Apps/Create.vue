<template>
  <UCard v-if="projectId">
    <template #header><h2 class="font-semibold">Create an App</h2></template>
    <form class="space-y-4" @submit.prevent="save">
      <UFormField label="App name" required><UInput v-model="name" class="w-full" /></UFormField>
      <UFormField label="App id" required><UInput v-model="id" class="w-full" placeholder="your-app" /></UFormField>
      <UFormField label="Description"><UTextarea v-model="description" class="w-full" /></UFormField>
      <UFormField label="App role" required><USelect v-model="role" :items="roles" placeholder="Choose a role" class="w-full" /></UFormField>
      <p class="text-sm text-muted">Ecosystem: {{ config.ecosystemId }}. Saves an inactive App with a minimal HTML preview. No hosting or new database is provisioned.</p>
      <MoleculesCopyError v-if="error" :message="error" />
      <UButton type="submit" :loading="saving" :disabled="!name.trim() || !id.trim() || !role">Save App and preview</UButton>
    </form>
    <p v-if="savedId" class="mt-4 text-sm">Saved {{ savedId }}. Its preview is available below.</p>
    <AppPreview v-if="savedApp" :app="savedApp" class="mt-4" />
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProjectApps } from '../../../composables/useProjectApps'
import { useProjectWorkspace } from '../../../composables/workspace/useProjectWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import AppPreview from 'fireux-core/runtime/app/components/Preview.vue'
const { projectId, apps, refresh } = useProjectApps(useProjectWorkspace().id, { management: true })
const config = useFireUXConfig()
const name = ref('')
const id = ref('')
const description = ref('')
const role = ref('')
const roles = [{ label: 'Tenant', value: 'tenant' }, { label: 'Standalone', value: 'standalone' }]
const saving = ref(false)
const error = ref('')
const savedId = ref('')
const savedApp = computed(() => apps.value.find(app => app.id === savedId.value))
watch(projectId, () => { savedId.value = ''; error.value = '' })
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  const selectedProject = projectId.value
  try {
    const user = await useRequireUser()
    const result = await $fetch<{ ok: true; app_id: string }>(`/api/internal/control/projects/${encodeURIComponent(selectedProject)}/apps`, {
      method: 'POST', headers: { authorization: `Bearer ${await user.getIdToken()}` },
      body: { id: id.value, name: name.value, description: description.value, role: role.value, ecosystem_id: config.ecosystemId },
    })
    if (projectId.value !== selectedProject) return
    savedId.value = result.app_id
    await refresh()
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : 'App creation failed.'
  } finally { saving.value = false }
}
</script>
