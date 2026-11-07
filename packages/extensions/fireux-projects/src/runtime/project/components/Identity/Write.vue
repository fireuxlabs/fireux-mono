<template>
  <UModal
    v-model:open="open"
    title="Edit Project Identity"
    description="Update this workspace’s identity and public directory status."
    :dismissible="!saving"
    :close="!saving"
  >
    <template #body>
      <form class="workspace-profile__form" @submit.prevent="save">
        <UFormField label="Name" required
          ><UInput
            v-model="name"
            maxlength="120"
            class="workspace-profile__input"
            autofocus
            :disabled="saving"
        /></UFormField>
        <UFormField label="Description"
          ><UTextarea
            v-model="description"
            maxlength="2000"
            class="workspace-profile__input"
            :disabled="saving"
        /></UFormField>
        <UFormField
          label="Image URL"
          hint="HTTPS; leave empty to remove the image."
          ><UInput
            v-model="imageUrl"
            type="url"
            class="workspace-profile__input"
            :disabled="saving"
        /></UFormField>
        <UFormField
          label="Status"
          hint="Active Projects appear in the public directory. Inactive Projects remain available in Workspace."
        >
          <USelect
            v-model="status"
            :items="statusItems"
            class="workspace-profile__input"
            :disabled="saving"
          />
        </UFormField>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          title="Identity could not be saved"
          :description="error"
        />
        <FireCopyError v-if="error" :message="error" />
        <p v-if="!sameProject" role="status" class="workspace-profile__warning">
          The selected Project changed. Close this editor and reopen it.
        </p>
        <div class="workspace-profile__actions">
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
              !status ||
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
import { useToast } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, onScopeDispose, ref, watch } from 'vue'
import type { ProjectIdentityIntent } from '../../models/identity-intent'
import type { ProjectWorkspaceIdentityState } from '../../composables/workspace/useProjectWorkspaceIdentity'
import type { ProjectStatus } from '../../models/project.model'
const props = defineProps<{
  identity: ProjectWorkspaceIdentityState
  requestedOpen?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
const open = ref(false)
const saving = ref(false)
const name = ref('')
const description = ref('')
const imageUrl = ref('')
const status = ref<ProjectStatus>()
const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] satisfies { label: string; value: ProjectStatus }[]
const projectId = ref('')
const error = ref('')
const original = ref('')
const toast = useToast()
const { currentUser } = useAuth()
let scopeEpoch = 0
function resetEditor() {
  scopeEpoch++
  open.value = false
  saving.value = false
  error.value = ''
  name.value = ''
  description.value = ''
  imageUrl.value = ''
  status.value = undefined
  projectId.value = ''
}
watch(
  [
    () => currentUser.value?.uid,
    () => props.identity.projectId.value,
    () => props.identity.canWrite.value,
  ],
  resetEditor,
  { flush: 'sync' }
)
onScopeDispose(resetEditor, true)
const sameProject = computed(
  () => projectId.value === props.identity.projectId.value
)
const signature = () =>
  JSON.stringify([
    name.value.trim(),
    description.value.trim(),
    imageUrl.value.trim(),
    status.value,
  ])
const changed = computed(() => signature() !== original.value)
watch(
  () => props.requestedOpen,
  (value: boolean | undefined) => {
    if (value) {
      if (props.identity.canWrite.value) show()
      else emit('close')
    } else if (!saving.value) open.value = false
  }
)
watch(open, (value: boolean) => {
  if (!value) emit('close')
})
function show(intent?: ProjectIdentityIntent) {
  if (!props.identity.canWrite.value) return
  projectId.value = props.identity.projectId.value
  name.value = props.identity.name.value
  description.value = props.identity.description.value
  imageUrl.value = props.identity.imageUrl.value
  status.value = props.identity.projectStatus.value
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
  if (
    saving.value ||
    !status.value ||
    !sameProject.value ||
    !props.identity.canWrite.value ||
    !changed.value
  )
    return
  const epoch = scopeEpoch
  saving.value = true
  error.value = ''
  try {
    await props.identity.update({
      projectId: projectId.value,
      name: name.value,
      description: description.value,
      imageUrl: imageUrl.value,
      status: status.value,
    })
    if (epoch !== scopeEpoch) return
    open.value = false
    toast.add({ title: 'Project Identity saved', color: 'success' })
  } catch (cause) {
    if (epoch === scopeEpoch)
      error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (epoch === scopeEpoch) saving.value = false
  }
}
defineExpose({ show })
</script>
