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
            v-model="draft.name"
            maxlength="120"
            class="workspace-profile__input"
            autofocus
            :disabled="saving"
        /></UFormField>
        <UFormField label="Description"
          ><UTextarea
            v-model="draft.description"
            maxlength="2000"
            class="workspace-profile__input"
            :disabled="saving"
        /></UFormField>
        <UFormField
          label="Image URL"
          hint="HTTPS; leave empty to remove the image."
          ><UInput
            v-model="draft.imageUrl"
            type="url"
            class="workspace-profile__input"
            :disabled="saving"
        /></UFormField>
        <UFormField
          label="Status"
          hint="Active Projects appear in the public directory. Inactive Projects remain available in Workspace."
        >
          <USelect
            v-model="draft.status"
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
              !draft.name.trim() ||
              !draft.status ||
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
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import { computed, ref, watch } from 'vue'
import type { ProjectIdentityIntent } from '../../models/identity-intent'
import type { ProjectWorkspaceIdentityState } from '../../composables/workspace/useProjectWorkspaceIdentity'
import type { ProjectStatus } from '../../models/project.model'
const props = defineProps<{
  identity: ProjectWorkspaceIdentityState
  requestedOpen?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
const open = ref(false)
const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] satisfies { label: string; value: ProjectStatus }[]
const toast = useToast()
const { currentUser } = useAuth()
type ProjectIdentityDraft = {
  projectId: string
  name: string
  description: string
  imageUrl: string
  status: ProjectStatus | undefined
}
const {
  draft,
  changed,
  saving,
  error,
  begin,
  save: saveDraft,
} = useIdentityEditor<ProjectIdentityDraft>({
  open,
  scope: [
    () => currentUser.value?.uid,
    () => props.identity.projectId.value,
    () => props.identity.outcome.value,
  ],
  canEdit: () => props.identity.canWrite.value,
  createDraft: () => ({
    projectId: props.identity.projectId.value,
    name: props.identity.name.value,
    description: props.identity.description.value,
    imageUrl: props.identity.imageUrl.value,
    status: props.identity.projectStatus.value,
  }),
  signature: (value) =>
    JSON.stringify([
      value.name.trim().replace(/\s+/g, ' '),
      value.description.trim(),
      value.imageUrl.trim(),
      value.status,
    ]),
  save: (value, isCurrent) => {
    if (!value.status) throw new Error('Choose active or inactive.')
    return props.identity.update({ ...value, status: value.status }, isCurrent)
  },
  onSaved: () => {
    open.value = false
    toast.add({ title: 'Project Identity saved', color: 'success' })
  },
  errorMessage: 'Try again.',
})
const sameProject = computed(
  () => draft.value.projectId === props.identity.projectId.value
)
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
  begin((value) => {
    if (intent?.action !== 'update') return
    if (intent.name !== null) value.name = intent.name
    if (intent.description !== null) value.description = intent.description
    if (intent.imageUrl !== null) value.imageUrl = intent.imageUrl
  })
}
async function save() {
  if (
    !draft.value.status ||
    !sameProject.value ||
    !props.identity.canWrite.value ||
    !changed.value
  )
    return
  await saveDraft()
}
defineExpose({ show })
</script>
