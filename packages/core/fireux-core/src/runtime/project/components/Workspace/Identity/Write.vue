<template>
  <UModal
    v-model:open="open"
    title="Edit Project Identity"
    description="Update this workspace’s name, description and image."
    :dismissible="!saving"
    :close="!saving"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="save">
        <UFormField label="Name" required
          ><UInput
            v-model="name"
            maxlength="120"
            class="w-full"
            autofocus
            :disabled="saving"
        /></UFormField>
        <UFormField label="Description"
          ><UTextarea
            v-model="description"
            maxlength="2000"
            class="w-full"
            :disabled="saving"
        /></UFormField>
        <UFormField
          label="Image URL"
          hint="HTTPS; leave empty to remove the image."
          ><UInput
            v-model="imageUrl"
            type="url"
            class="w-full"
            :disabled="saving"
        /></UFormField>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          title="Identity could not be saved"
          :description="error"
        />
        <p v-if="!sameProject" role="status" class="text-sm text-warning">
          The selected Project changed. Close this editor and reopen it.
        </p>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="saving"
            @click="open = false"
          />
          <UButton
            type="submit"
            label="Save changes"
            :loading="saving"
            :disabled="
              !name.trim() ||
              !sameProject ||
              !identity.canWrite.value ||
              !changed
            "
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectIdentityIntent } from '../../../models/identity-intent'
import type { ProjectWorkspaceIdentityState } from '../../../composables/workspace/identity/useProjectWorkspaceIdentity'
const props = defineProps<{ identity: ProjectWorkspaceIdentityState }>()
const open = ref(false)
const saving = ref(false)
const name = ref('')
const description = ref('')
const imageUrl = ref('')
const projectId = ref('')
const error = ref('')
const original = ref('')
const toast = useToast()
const sameProject = computed(
  () => projectId.value === props.identity.projectId.value
)
const signature = () =>
  JSON.stringify([
    name.value.trim(),
    description.value.trim(),
    imageUrl.value.trim(),
  ])
const changed = computed(() => signature() !== original.value)
function show(intent?: ProjectIdentityIntent) {
  if (!props.identity.canWrite.value) return
  projectId.value = props.identity.projectId.value
  name.value = props.identity.name.value
  description.value = props.identity.description.value
  imageUrl.value = props.identity.imageUrl.value
  original.value = signature()
  if (intent?.action === 'update') {
    if (intent.name !== null) name.value = intent.name
    if (intent.description !== null) description.value = intent.description
    if (intent.imageUrl !== null) imageUrl.value = intent.imageUrl
  }
  error.value = ''
  open.value = true
}
async function save() {
  if (saving.value || !sameProject.value || !changed.value) return
  saving.value = true
  error.value = ''
  try {
    await props.identity.update({
      projectId: projectId.value,
      name: name.value,
      description: description.value,
      imageUrl: imageUrl.value,
    })
    open.value = false
    toast.add({ title: 'Project Identity saved', color: 'success' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    saving.value = false
  }
}
defineExpose({ show })
</script>
