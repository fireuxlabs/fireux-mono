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

    <UFormField label="Image" required>
      <div class="flex flex-col items-center gap-2">
        <MoleculesFormsEditableImagePicker
          :src="form.image_url || ''"
          :alt="form.name || 'Ingredient'"
          :initials="imageInitials"
          :update="handleImageUpload"
        />
        <p v-if="imageUploading" class="text-xs text-muted">
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
        :disabled="imageUploading || !form.image_url"
        @click="handleCreate"
      >
        Add ingredient
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { computed, ref } from 'vue'
import { useIngredientCreate } from '../../composables/firestore/mutations/useIngredientCreate'
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
const INGREDIENT_IMAGE_MAX_DIMENSION = 1600
const INGREDIENT_IMAGE_QUALITY = 0.86

const clearDraft = () => {
  form.value = createDefaultIngredientForm()
}

const imageInitials = computed(() => {
  const rawName = String(form.value.name || '').trim()
  if (!rawName) return 'I'
  const parts = rawName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
})

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read image file'))
    }
    image.src = objectUrl
  })

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })

const resizeIngredientImage = async (file: File): Promise<Blob | File> => {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/svg+xml') return file

  const image = await loadImage(file)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const maxSide = Math.max(sourceWidth, sourceHeight)
  if (!maxSide) return file

  const scale = Math.min(1, INGREDIENT_IMAGE_MAX_DIMENSION / maxSide)
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(image, 0, 0, width, height)

  const webp = await toBlob(canvas, 'image/webp', INGREDIENT_IMAGE_QUALITY)
  if (webp) return webp

  const fallbackType =
    file.type === 'image/png' ? 'image/png' : file.type || 'image/jpeg'
  const fallback = await toBlob(canvas, fallbackType, INGREDIENT_IMAGE_QUALITY)
  return fallback ?? file
}

const handleImageUpload = async (file: File) => {
  if (imageUploading.value || submitting.value) return

  const name = String(form.value.name || '').trim()
  const ingredientId = normalizeSlug(name)
  if (!ingredientId) {
    toast.error('Set ingredient name before uploading image')
    return
  }

  imageUploading.value = true
  try {
    const path = `ingredients/${ingredientId}/image_url`
    const resized = await resizeIngredientImage(file)
    form.value.image_url = await uploadImage(path, resized)
    toast.success('Image uploaded')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to upload image'))
  } finally {
    imageUploading.value = false
  }
}

const handleCreate = async () => {
  if (submitting.value || imageUploading.value) return
  if (!form.value.image_url) {
    toast.error('Add an ingredient image before creating the root')
    return
  }
  submitting.value = true

  try {
    const result = await createIngredient({
      name: form.value.name,
      aliases: form.value.aliases
        .split(',')
        .map((alias: string) => alias.trim())
        .filter(Boolean),
      category: form.value.category,
      kind: form.value.kind,
      parent_ingredient_id: form.value.parent_ingredient_id || undefined,
      status: 'active',
      image_url: form.value.image_url,
    })
    toast.success('Ingredient added')
    clearDraft()
    emit('created', result.id)
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add ingredient'))
  } finally {
    submitting.value = false
  }
}
</script>
