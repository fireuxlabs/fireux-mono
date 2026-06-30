<template>
  <UCard v-if="dish">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Dish details
          </h2>
          <p class="text-sm text-dimmed">
            Update the dish image, name, and description.
          </p>
        </div>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <UFormField label="Image">
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsFirestoreImagePicker
            v-if="canWrite"
            :src="dishImageUrl"
            :alt="dishName || 'Dish'"
            :initials="imageInitials"
            :update-function="handleImageUpload"
          />
          <UAvatar
            v-else
            :src="dishImageUrl || undefined"
            :alt="dishName || 'Dish'"
            :text="imageInitials"
            icon="i-lucide-utensils"
            size="3xl"
          />
          <p
            v-if="imageUploading"
            class="text-xs text-dimmed"
          >
            Uploading image...
          </p>
        </div>
      </UFormField>

      <div class="grid gap-4">
        <MoleculesFormsFirestoreSimpleField
          label="Name"
          :firebase-value="dishName"
          placeholder="Dish name"
          :maxlength="140"
          :disabled="!canWrite"
          disabled-message="This dish is read-only."
          :validation-function="validateDishName"
          :update-function="handleName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Description"
          type="textarea"
          :rows="5"
          :firebase-value="dishDescription"
          placeholder="Default dish description"
          :maxlength="800"
          :disabled="!canWrite"
          disabled-message="This dish is read-only."
          :update-function="handleDescription"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDish'
import { useDish } from '../../../../../composables/fireux/firestore/dish/useDish'
import type { DishUpdateInput } from '../../../../../models/kitchen/dish.model'

const {
  dish,
  dishId,
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleDish()

const toast = useToastify()
const { updateDish } = useDish({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { uploadImage } = useImageStorage()
const imageUploading = ref(false)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const dishName = computed(() => normalizeString(dish.value?.name))
const dishDescription = computed(() => normalizeString(dish.value?.description))
const dishImageUrl = computed(() => normalizeString(dish.value?.image_url))
const imageInitials = computed(() => {
  const parts = dishName.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
})

const validateDishName = (value: string) => {
  const next = normalizeString(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'Dish name is required.',
  }
}

async function updateDishField(
  patch: DishUpdateInput,
  successTitle: string,
  failTitle: string
) {
  if (!canWrite.value) throw new Error('This dish is read-only.')
  if (!dishId.value || !kitchenId.value) throw new Error('No dish selected.')
  try {
    await updateDish(dishId.value, patch, { kitchenId: kitchenId.value })
    toast.add({ title: successTitle, color: 'success', icon: 'i-lucide-check' })
    return 'success'
  } catch (error) {
    toast.add({
      title: failTitle,
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateDishField(
    { name: normalizeString(value) },
    'Dish name updated',
    'Could not update dish name'
  )

const handleDescription = async (value: string) =>
  updateDishField(
    { description: normalizeString(value) },
    'Dish description updated',
    'Could not update dish description'
  )

const handleImageUpload = async (file: File) => {
  if (!canWrite.value || !dishId.value || !kitchenId.value) return
  imageUploading.value = true
  try {
    const url = await uploadImage(
      `kitchens/${kitchenId.value}/dishes/${dishId.value}/image/current`,
      file
    )
    await updateDishField(
      { image_url: url },
      'Dish image updated',
      'Could not update dish image'
    )
  } finally {
    imageUploading.value = false
  }
}
</script>
