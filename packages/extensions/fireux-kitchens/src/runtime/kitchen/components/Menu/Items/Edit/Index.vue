<template>
  <UCard v-if="dish">
    <template #header>
      <h2>Details</h2>
    </template>

    <div class="fx-card-body-stack">
      <div class="item-details-identity">
        <UFormField label="Photo">
          <FireFormsEditableImagePicker
            v-if="canWrite"
            :src="photoImageUrl(itemImageUrl)"
            :alt="itemName || catalogue.singular"
            :initials="imageInitials"
            avatar-class="item-details-photo"
            button-label="Change Item photo"
            :loading="imageUploading"
            :disabled="busy"
            :update="handleImageUpload"
          />
          <UAvatar
            v-else
            :src="photoImageUrl(itemImageUrl) || undefined"
            :alt="itemName || 'Item'"
            :text="imageInitials"
            icon="i-lucide-sandwich"
            size="3xl"
            class="item-details-photo"
          />
          <p v-if="imageUploading" role="status">Uploading photo…</p>
        </UFormField>
        <div class="fx-card-body-stack">
          <FireFormsEditableSimpleField
            label="Name"
            :value="itemName"
            :placeholder="`${singularTitle} name`"
            :maxlength="140"
            :disabled="!canWrite || imageUploading || flagshipSaving"
            :disabled-message="`This ${catalogue.singular} is read-only.`"
            :validation-function="validateItemName"
            :capture-intent="captureScope"
            :update="handleName"
          />
          <FireFormsEditableSimpleField
            label="Description"
            type="textarea"
            :rows="5"
            :value="itemDescription"
            :placeholder="`Default ${catalogue.singular} description`"
            :maxlength="800"
            :disabled="!canWrite || imageUploading || flagshipSaving"
            :disabled-message="`This ${catalogue.singular} is read-only.`"
            :capture-intent="captureScope"
            :update="handleDescription"
          />
          <KitchenMenuItemsDescriptionAssistant
            v-if="catalogue.itemKind === 'drink'"
          />
        </div>
      </div>
      <div class="item-details-organisation">
        <FireFormsEditableSimpleField
          label="Category"
          :value="dish.category || ''"
          placeholder="Add category"
          :disabled="!canWrite || busy"
          :capture-intent="captureScope"
          :update="handleCategory"
        />
        <UFormField label="Featured item">
          <USwitch
            :model-value="itemFlagship"
            :disabled="!canWrite || busy"
            @update:model-value="handleFlagship"
          />
        </UFormField>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { refreshNuxtData } from 'nuxt/app'
import { photoImageUrl } from 'fireux-core/runtime/utils/photo-image-url'

import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'
const { catalogue } = useKitchenItemsContext()
import { useItemEditorScope } from '../../../../composables/item/useItemEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenItemDetail } from '../../../../composables/item/useKitchenItemDetailContext'
import { useItemImageUpload } from '../../../../composables/item/useItemImageUpload'
import { useItemUpdate } from '../../../../composables/item/useItemUpdate'
import type { ItemUpdateInput } from '../../../../utils/item.ts'

const { dish, dishId, kitchenId, canWrite } = useKitchenItemDetail()

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
const captureScope = useItemEditorScope(
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
const { updateItem } = useItemUpdate(ownerSources)
const { uploadItemImage } = useItemImageUpload(ownerSources)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const singularTitle = computed(
  () =>
    `${catalogue.singular.charAt(0).toUpperCase()}${catalogue.singular.slice(1)}`
)
const itemName = computed(() => normalizeString(dish.value?.name))
const itemDescription = computed(() => normalizeString(dish.value?.description))
const itemImageUrl = computed(() => normalizeString(dish.value?.image))
const itemFlagship = computed(() => dish.value?.is_flagship === true)
const imageInitials = computed(() => {
  const parts = itemName.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return (parts[0] || '').slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})

const validateItemName = (value: string) => {
  const next = normalizeString(value)
  return {
    isValid: Boolean(next),
    message: next ? '' : 'Item name is required.',
  }
}

async function updateItemField(
  patch: ItemUpdateInput,
  successTitle: string,
  failTitle: string,
  isSurfaceCurrent?: () => boolean
) {
  if (fieldSaving.value && fieldCurrent.value && !fieldCurrent.value())
    fieldSaving.value = false
  if (busy.value) throw new Error('A Item change is already being saved.')
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
    await updateItem(dishId.value, patch, {
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

const handleCategory = (value: string, isSurfaceCurrent?: () => boolean) =>
  updateItemField(
    { category: value.trim() },
    'Category updated',
    'Could not update category',
    isSurfaceCurrent
  )

const handleName = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateItemField(
    { name: normalizeString(value) },
    `${catalogue.singular} name updated`,
    `Could not update ${catalogue.singular} name`,
    isSurfaceCurrent
  )

const handleDescription = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateItemField(
    { description: normalizeString(value) },
    `${catalogue.singular} description updated`,
    `Could not update ${catalogue.singular} description`,
    isSurfaceCurrent
  )

const handleFlagship = async (value: boolean) => {
  const isCurrent = captureScope()
  const requestedItemId = dishId.value,
    requestedKitchenId = kitchenId.value
  if (!canWrite.value || busy.value || !dishId.value || !kitchenId.value) return
  flagshipSaving.value = true
  try {
    const token = await currentUser.value?.getIdToken()
    if (!isCurrent() || !canWrite.value) return
    if (!token) throw new Error('Sign in before updating the flagship Item.')
    await $fetch(`/api/workspace/kitchen/dishes/${requestedItemId}/flagship`, {
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
      title: value ? 'Flagship Item selected' : 'Flagship Item cleared',
      color: 'success',
      icon: 'i-lucide-star',
    })
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'Could not update flagship Item',
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
  const requestedItemId = dishId.value,
    requestedKitchenId = kitchenId.value
  if (!canWrite.value || busy.value || !dishId.value || !kitchenId.value) return
  imageUploading.value = true
  try {
    await uploadItemImage({
      dishId: requestedItemId,
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

<style scoped>
.item-details-identity {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  align-items: start;
  gap: calc(var(--spacing) * 4);
}
.item-details-identity :deep(.item-details-photo),
.item-details-photo {
  border-radius: var(--ui-radius);
}
.item-details-organisation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}
@media (max-width: 640px) {
  .item-details-identity,
  .item-details-organisation {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
