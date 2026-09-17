<!-- Concurrent edit — 2026-07-22 00:37 CEST — Dish media ownership: replace direct client Storage writes with the Kitchen-owned Dish upload. -->
<template>
  <UCard v-if="dish">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            {{ singularTitle }} details
          </h2>
          <p class="text-sm text-dimmed">
            Update the {{ catalogue.singular }} image, name, and description.
          </p>
        </div>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <UFormField label="Image">
        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsEditableImagePicker
            v-if="canWrite"
            :src="dishImageUrl"
            :alt="dishName || catalogue.singular"
            :initials="imageInitials"
            :loading="imageUploading"
            :update="handleImageUpload"
          />
          <UAvatar
            v-else
            :src="dishImageUrl || undefined"
            :alt="dishName || 'Dish'"
            :text="imageInitials"
            icon="i-lucide-utensils"
            size="3xl"
          />
          <p v-if="imageUploading" class="text-xs text-dimmed">
            Uploading image...
          </p>
          <p v-else-if="canWrite" class="text-center text-xs text-dimmed">
            Use a transparent-background source. Storage keeps a 1200 × 1200
            WebP.
          </p>
        </div>
      </UFormField>

      <div class="grid gap-4">
        <UFormField label="Flagship dish">
          <USwitch
            :model-value="dishFlagship"
            :disabled="!canWrite || flagshipSaving"
            @update:model-value="handleFlagship"
          />
          <p class="mt-1 text-xs text-dimmed">
            Templates feature the one flagship Dish selected for this Kitchen.
          </p>
        </UFormField>

        <MoleculesFormsEditableSimpleField
          label="Name"
          :value="dishName"
          :placeholder="`${singularTitle} name`"
          :maxlength="140"
          :disabled="!canWrite"
          :disabled-message="`This ${catalogue.singular} is read-only.`"
          :validation-function="validateDishName"
          :update="handleName"
        />

        <MoleculesFormsEditableSimpleField
          label="Description"
          type="textarea"
          :rows="5"
          :value="dishDescription"
          :placeholder="`Default ${catalogue.singular} description`"
          :maxlength="800"
          :disabled="!canWrite"
          :disabled-message="`This ${catalogue.singular} is read-only.`"
          :update="handleDescription"
        />

        <WorkspaceKitchenDishesDescriptionAssistant
          v-if="catalogue.itemKind === 'drink'"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'
import { useDishImageUpload } from '../../../composables/dish/useDishImageUpload'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
import type { DishUpdateInput } from '../../../utils/dish.ts'

const {
  dish,
  dishId,
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
  catalogue,
} = useKitchenWorkspaceDish()

const toast = useToastify()
const { currentUser } = useAuth()
const { updateDish } = useDishUpdate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { uploadDishImage } = useDishImageUpload()
const imageUploading = ref(false)
const flagshipSaving = ref(false)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const singularTitle = computed(
  () =>
    `${catalogue.singular.charAt(0).toUpperCase()}${catalogue.singular.slice(1)}`
)
const dishName = computed(() => normalizeString(dish.value?.name))
const dishDescription = computed(() => normalizeString(dish.value?.description))
const dishImageUrl = computed(() => normalizeString(dish.value?.image))
const dishFlagship = computed(() => dish.value?.is_flagship === true)
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
  if (!canWrite.value) {
    throw new Error(`This ${catalogue.singular} is read-only.`)
  }
  if (!dishId.value || !kitchenId.value) {
    throw new Error(`No ${catalogue.singular} selected.`)
  }
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
    `${catalogue.singular} name updated`,
    `Could not update ${catalogue.singular} name`
  )

const handleDescription = async (value: string) =>
  updateDishField(
    { description: normalizeString(value) },
    `${catalogue.singular} description updated`,
    `Could not update ${catalogue.singular} description`
  )

const handleFlagship = async (value: boolean) => {
  if (!canWrite.value || !dishId.value || !kitchenId.value) return
  flagshipSaving.value = true
  try {
    const token = await currentUser.value?.getIdToken()
    if (!token) throw new Error('Sign in before updating the flagship Dish.')
    await $fetch(`/api/workspace/kitchen/dishes/${dishId.value}/flagship`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      query: { kitchenId: kitchenId.value },
      body: { is_flagship: value },
    })
    toast.add({
      title: value ? 'Flagship Dish selected' : 'Flagship Dish cleared',
      color: 'success',
      icon: 'i-lucide-star',
    })
  } catch (error) {
    toast.add({
      title: 'Could not update flagship Dish',
      description: (error as any)?.data?.statusMessage || 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  } finally {
    flagshipSaving.value = false
  }
}

const handleImageUpload = async (file: File) => {
  if (!canWrite.value || !dishId.value || !kitchenId.value) return
  imageUploading.value = true
  try {
    await uploadDishImage({
      dishId: dishId.value,
      kitchenId: kitchenId.value,
      file,
    })
    toast.add({
      title: `${catalogue.singular} image updated`,
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: `Could not update ${catalogue.singular} image`,
      description:
        (error as any)?.data?.statusMessage ||
        (error instanceof Error ? error.message : 'Please try again.'),
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  } finally {
    imageUploading.value = false
  }
}
</script>
