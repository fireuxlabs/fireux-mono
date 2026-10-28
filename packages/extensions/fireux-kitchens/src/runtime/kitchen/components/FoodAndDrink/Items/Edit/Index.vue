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
          <FireFormsEditableImagePicker
            v-if="canWrite"
            :src="dishImageUrl"
            :alt="dishName || catalogue.singular"
            :initials="imageInitials"
            :loading="imageUploading"
            :disabled="busy"
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
        <UFormField v-if="catalogue.itemKind === 'food'" label="Category">
          <USelect
            :model-value="dish.category"
            :items="[...dishCategories]"
            placeholder="Choose category"
            aria-label="Dish category"
            :disabled="!canWrite || busy"
            @update:model-value="handleCategory"
          />
        </UFormField>
        <UFormField label="Flagship dish">
          <USwitch
            :model-value="dishFlagship"
            :disabled="!canWrite || busy"
            @update:model-value="handleFlagship"
          />
          <p class="mt-1 text-xs text-dimmed">
            Templates feature the one flagship Dish selected for this Kitchen.
          </p>
        </UFormField>

        <FireFormsEditableSimpleField
          label="Name"
          :value="dishName"
          :placeholder="`${singularTitle} name`"
          :maxlength="140"
          :disabled="!canWrite || imageUploading || flagshipSaving"
          :disabled-message="`This ${catalogue.singular} is read-only.`"
          :validation-function="validateDishName"
          :capture-intent="captureScope"
          :update="handleName"
        />

        <FireFormsEditableSimpleField
          label="Description"
          type="textarea"
          :rows="5"
          :value="dishDescription"
          :placeholder="`Default ${catalogue.singular} description`"
          :maxlength="800"
          :disabled="!canWrite || imageUploading || flagshipSaving"
          :disabled-message="`This ${catalogue.singular} is read-only.`"
          :capture-intent="captureScope"
          :update="handleDescription"
        />

        <KitchenFoodAndDrinkItemsDescriptionAssistant
          v-if="catalogue.itemKind === 'drink'"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { refreshNuxtData } from 'nuxt/app'

import { useKitchenWorkspace } from '../../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
const workspace = useKitchenWorkspace()
const { catalogue } = useKitchenDishesContext()
import { useDishEditorScope } from '../../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenDishDetail } from '../../../../composables/dish/useKitchenDishDetail'
import { useDishImageUpload } from '../../../../composables/dish/useDishImageUpload'
import { useDishUpdate } from '../../../../composables/dish/useDishUpdate'
import { dishCategories } from '../../../../models/dish.model'
import type { DishUpdateInput } from '../../../../utils/dish.ts'

const { dish, dishId, kitchenId, canWrite } = useKitchenDishDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('dishId')
)

const toast = useToastify()
const { currentUser } = useAuth()
const route = useRoute()
const imageUploading = ref(false)
const flagshipSaving = ref(false)
const fieldSaving = ref(false)
const fieldCurrent = ref<(() => boolean) | undefined>()
let fieldGeneration = 0
const busy = computed(
  () => imageUploading.value || flagshipSaving.value || fieldSaving.value
)
const captureScope = useDishEditorScope(
  [kitchenId, dishId, () => catalogue.itemKind, () => route.fullPath],
  () => {
    imageUploading.value = false
    flagshipSaving.value = false
    fieldSaving.value = false
  }
)
const ownerSources = [
  kitchenId,
  dishId,
  () => catalogue.itemKind,
  () => route.fullPath,
  canWrite,
]
const { updateDish } = useDishUpdate(ownerSources)
const { uploadDishImage } = useDishImageUpload(ownerSources)

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
  if (parts.length === 1) return (parts[0] || '').slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
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
  failTitle: string,
  isSurfaceCurrent?: () => boolean
) {
  if (fieldSaving.value && fieldCurrent.value && !fieldCurrent.value())
    fieldSaving.value = false
  if (busy.value) throw new Error('A Dish change is already being saved.')
  fieldCurrent.value = isSurfaceCurrent
  const generation = ++fieldGeneration
  const isOwnerCurrent = captureScope()
  const isCurrent = () =>
    isOwnerCurrent() &&
    generation === fieldGeneration &&
    (!isSurfaceCurrent || isSurfaceCurrent())
  if (!canWrite.value) {
    throw new Error(`This ${catalogue.singular} is read-only.`)
  }
  if (!dishId.value || !kitchenId.value) {
    throw new Error(`No ${catalogue.singular} selected.`)
  }
  fieldSaving.value = true
  try {
    await updateDish(dishId.value, patch, {
      kitchenId: kitchenId.value,
      isCurrent,
    })
    if (!isCurrent()) return
    toast.add({ title: successTitle, color: 'success', icon: 'i-lucide-check' })
    return 'success'
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: failTitle,
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  } finally {
    if (isOwnerCurrent() && generation === fieldGeneration)
      fieldSaving.value = false
  }
}

const handleCategory = (value: unknown) => {
  const category = dishCategories.find((item) => item.value === value)?.value
  if (category)
    return updateDishField(
      { category },
      'Category updated',
      'Could not update category'
    )
}

const handleName = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateDishField(
    { name: normalizeString(value) },
    `${catalogue.singular} name updated`,
    `Could not update ${catalogue.singular} name`,
    isSurfaceCurrent
  )

const handleDescription = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateDishField(
    { description: normalizeString(value) },
    `${catalogue.singular} description updated`,
    `Could not update ${catalogue.singular} description`,
    isSurfaceCurrent
  )

const handleFlagship = async (value: boolean) => {
  const isCurrent = captureScope()
  const requestedDishId = dishId.value,
    requestedKitchenId = kitchenId.value
  if (!canWrite.value || busy.value || !dishId.value || !kitchenId.value) return
  flagshipSaving.value = true
  try {
    const token = await currentUser.value?.getIdToken()
    if (!isCurrent() || !canWrite.value) return
    if (!token) throw new Error('Sign in before updating the flagship Dish.')
    await $fetch(`/api/workspace/kitchen/dishes/${requestedDishId}/flagship`, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      query: { kitchenId: requestedKitchenId },
      body: { is_flagship: value },
    })
    if (!isCurrent()) return
    toast.add({
      title: value ? 'Flagship Dish selected' : 'Flagship Dish cleared',
      color: 'success',
      icon: 'i-lucide-star',
    })
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'Could not update flagship Dish',
      description: (error as any)?.data?.statusMessage || 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  } finally {
    if (isCurrent()) flagshipSaving.value = false
  }
}

const handleImageUpload = async (file: File) => {
  const isCurrent = captureScope()
  const requestedDishId = dishId.value,
    requestedKitchenId = kitchenId.value
  if (!canWrite.value || busy.value || !dishId.value || !kitchenId.value) return
  imageUploading.value = true
  try {
    await uploadDishImage({
      dishId: requestedDishId,
      kitchenId: requestedKitchenId,
      file,
    })
    if (!isCurrent()) return
    toast.add({
      title: `${catalogue.singular} image updated`,
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    if (!isCurrent()) return
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
    if (isCurrent()) imageUploading.value = false
  }
}
</script>
