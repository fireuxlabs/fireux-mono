<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Add Ingredient</div>
        <p class="text-xs text-dimmed">
          Create a global ingredient for this runtime.
        </p>
      </div>
    </template>

    <UFormField label="Image">
      <div class="flex flex-col items-center gap-2">
        <MoleculesFormsFirestoreImagePicker
          :src="form.image_url || ''"
          :alt="form.name || 'Ingredient'"
          :initials="imageInitials"
          :update-function="handleImageUpload"
        />
        <p v-if="imageUploading" class="text-xs text-gray-500">
          Uploading image...
        </p>
      </div>
    </UFormField>

    <IngredientCreateWrite v-model:form="form" />

    <div class="mt-4 flex justify-end gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="submitting || imageUploading"
        @click="clearDraft"
      >
        Clear
      </UButton>
      <UButton
        color="primary"
        :loading="submitting || imageUploading"
        :disabled="imageUploading"
        @click="handleCreate"
      >
        Add ingredient
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useIngredientCreate } from '../../../../composables/fireux/firestore/ingredient/mutations/useIngredientCreate'
import { createDefaultIngredientForm, type IngredientCreateForm } from './types'

const emit = defineEmits<{
  (e: 'created', id: string): void
}>()

const toast = useToastify()
const { createIngredient } = useIngredientCreate()
const { uploadImage } = useImageStorage()

const submitting = ref(false)
const imageUploading = ref(false)
const form = ref<IngredientCreateForm>(createDefaultIngredientForm())

const clearDraft = () => {
  form.value = createDefaultIngredientForm()
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const imageInitials = computed(() => {
  const rawName = String(form.value.name || '').trim()
  if (!rawName) return 'I'
  const parts = rawName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
})

const handleImageUpload = async (file: File) => {
  if (imageUploading.value || submitting.value) return

  const name = String(form.value.name || '').trim()
  const ingredientId = toSlug(name)
  if (!ingredientId) {
    toast.error('Set ingredient name before uploading image')
    return
  }

  imageUploading.value = true
  try {
    const path = `ingredients/${ingredientId}/image_url`
    form.value.image_url = await uploadImage(path, file)
    toast.success('Image uploaded')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to upload image'))
  } finally {
    imageUploading.value = false
  }
}

const handleCreate = async () => {
  if (submitting.value || imageUploading.value) return
  submitting.value = true

  try {
    const id = await createIngredient(form.value)
    toast.success('Ingredient added')
    clearDraft()
    emit('created', id)
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add ingredient'))
  } finally {
    submitting.value = false
  }
}
</script>
