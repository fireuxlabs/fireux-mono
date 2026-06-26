<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/console/kitchen/dishes"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to dishes
      </UButton>

      <UButton
        v-if="dish && canWrite"
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        size="sm"
        :loading="deleting"
        @click="deleteSelectedDish"
      >
        Delete
      </UButton>
    </div>

    <div
      v-if="dish"
      class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div class="space-y-6">
        <ConsoleKitchenOperationsDishesCardsProfile :dish="dish" />
      </div>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div>
              <div class="console-card-header__title">Edit copy</div>
              <p class="text-sm text-dimmed">
                Update the default dish text.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
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
      </UCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading dish' : 'Dish not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen dish.'
          : `No dish was found for ${dishId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      title="Kitchen dish detail"
      scope="console"
      :data="fireuxDebugData"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDish'
import { useDish } from '../../../../../composables/fireux/firestore/dish/useDish'
import type { DishUpdateInput } from '../../../../../models/dish.model'

const {
  dish,
  dishId,
  kitchenId,
  rootCollection,
  databaseId,
  pending,
  canWrite,
  debug,
} = useKitchenConsoleDish()

const toast = useToastify()
const { updateDish, deleteDish } = useDish({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { uploadImage } = useImageStorage()
const imageUploading = ref(false)
const deleting = ref(false)

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

const fireuxDebugData = computed(() => ({
  ...debug.value,
  dish: dish.value,
}))

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

const deleteSelectedDish = async () => {
  if (!canWrite.value || !dish.value || deleting.value) return

  const title = normalizeString(dish.value.name)
  const ok = window.confirm(
    `Delete dish "${title}"?\n\nThis will only delete the dish document.`
  )
  if (!ok) return

  deleting.value = true

  try {
    await deleteDish(dishId.value, { kitchenId: kitchenId.value })
    toast.add({ title: 'Dish deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/console/kitchen/dishes')
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to delete dish')
    toast.add({
      title: 'Dish delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
