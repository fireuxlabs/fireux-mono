<template>
  <form class="space-y-5" @submit.prevent="save">
    <UFormField label="Name" required
      ><UInput
        v-model="draft.name"
        :maxlength="120"
        :disabled="busy"
        class="w-full"
    /></UFormField>
    <UFormField label="Property type"
      ><USelect
        v-model="draft.property_type"
        :items="types"
        :disabled="busy"
        class="w-full"
    /></UFormField>
    <UFormField label="Units"
      ><UInput
        v-model="draft.unit_count"
        type="number"
        :min="0"
        :step="1"
        :disabled="busy"
        class="w-full"
    /></UFormField>
    <UFormField label="Profile image">
      <div class="flex flex-wrap items-center gap-3">
        <UAvatar
          :src="draft.image_url || undefined"
          icon="i-lucide-house"
          size="3xl"
        />
        <UButton
          :label="draft.image_url ? 'Change image' : 'Add image'"
          color="neutral"
          variant="soft"
          :loading="uploading"
          :disabled="busy"
          @click="imageInput?.click()"
        />
        <UButton
          v-if="draft.image_url"
          label="Remove"
          color="neutral"
          variant="ghost"
          :disabled="busy"
          @click="draft.image_url = ''"
        />
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          class="sr-only"
          aria-label="Upload property image"
          :disabled="busy"
          @change="upload"
        />
      </div>
    </UFormField>
    <UAlert
      v-if="error"
      title="Could not save profile"
      :description="error"
      color="error"
    >
      <template #actions><FireCopyError :message="error" /></template>
    </UAlert>
    <div class="flex justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        :disabled="busy"
        @click="emit('close')"
      />
      <UButton
        label="Save changes"
        type="submit"
        :loading="saving"
        :disabled="busy || !dirty || !identity.canWrite.value"
      />
    </div>
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { usePropertyIdentityUpdate } from '../../../composables/usePropertyIdentityUpdate'
import type { PropertyWorkspaceIdentityState } from '../../../composables/workspace/usePropertyWorkspaceIdentity'
import type { PropertyIdentityUpdateInput } from '../../../models/property.model'
const props = defineProps<{ identity: PropertyWorkspaceIdentityState }>()
const emit = defineEmits<{ close: [] }>()
const { updateIdentity } = usePropertyIdentityUpdate()
const { currentUser } = useAuth()
const captureIntent = useCommandScope([
  () => currentUser.value?.uid,
  props.identity.propertyId,
  props.identity.canWrite,
])
const readFields = () => {
  const saved = props.identity.selectedProperty.value?.identity
  return {
    name: saved?.name || '',
    image_url: saved?.image_url || '',
    property_type: saved?.property_type || ('residential' as const),
    unit_count: Number(saved?.unit_count || 0),
  }
}
const original = readFields()
const originalSignature = JSON.stringify(original)
const draft = ref({ ...original })
const isEditorCurrent = captureIntent()
const saving = ref(false),
  uploading = ref(false),
  error = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const busy = computed(() => saving.value || uploading.value)
const dirty = computed(() => JSON.stringify(draft.value) !== originalSignature)
const { uploadImage } = useImageStorage()
const toast = useToastify()
const types = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Mixed', value: 'mixed' },
]
async function upload(event: Event) {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0]
  input.value = ''
  if (!file || busy.value || !isEditorCurrent()) return
  const propertyId = props.identity.propertyId.value
  uploading.value = true
  error.value = ''
  try {
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)
      throw new Error('Choose an image smaller than 10 MB.')
    const url = await uploadImage(
      `properties/${propertyId}/images/${crypto.randomUUID()}`,
      file
    )
    if (isEditorCurrent()) draft.value.image_url = url
  } catch (cause) {
    if (isEditorCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Image could not be uploaded.'
  } finally {
    uploading.value = false
  }
}
async function save() {
  if (busy.value || !isEditorCurrent()) return
  error.value = ''
  try {
    if (!props.identity.canWrite.value)
      throw new Error('This Property is read-only.')
    if (JSON.stringify(readFields()) !== originalSignature)
      throw new Error(
        'These details changed while you were editing. Reopen the editor.'
      )
    const values = {
      ...draft.value,
      unit_count: Number(draft.value.unit_count),
    }
    if (
      !values.name.trim() ||
      !Number.isSafeInteger(values.unit_count) ||
      values.unit_count < 0
    )
      throw new Error('Add a name and a whole number of units.')
    const changes = Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => value !== original[key as keyof typeof original]
      )
    ) as PropertyIdentityUpdateInput
    if (!Object.keys(changes).length) return
    saving.value = true
    await updateIdentity({
      propertyId: props.identity.propertyId.value,
      changes,
    })
    if (isEditorCurrent()) {
      toast.success('Property profile updated')
      emit('close')
    }
  } catch (cause) {
    if (isEditorCurrent())
      error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
