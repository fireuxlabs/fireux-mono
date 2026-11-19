<template>
  <UCard v-if="item">
    <template #header>
      <h2>Details</h2>
    </template>

    <div class="fx-card-body-stack">
      <div class="item-details-identity">
        <UFormField label="Photo">
          <FireFormsEditableImagePicker
            v-if="canWrite"
            :src="photoImageUrl(itemImageUrl)"
            :alt="itemName || 'Item'"
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
            placeholder="Item name"
            :maxlength="140"
            :disabled="!canWrite || imageUploading"
            disabled-message="This Item is read-only."
            :validation-function="validateItemName"
            :capture-intent="captureScope"
            :update="handleName"
          />
          <FireFormsEditableSimpleField
            label="Description"
            type="textarea"
            :rows="5"
            :value="itemDescription"
            placeholder="Description"
            :maxlength="800"
            :disabled="!canWrite || imageUploading"
            disabled-message="This Item is read-only."
            :capture-intent="captureScope"
            :update="handleDescription"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { photoImageUrl } from 'fireux-core/runtime/utils/photo-image-url'

import { useItemEditorScope } from '../../../../../composables/items/useItemEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'
import { useItemImageUpload } from '../../../../../composables/items/useItemImageUpload'
import { useItemUpdate } from '../../../../../composables/items/useItemUpdate'
import type { ItemIdentityChanges } from '../../../../../utils/item-identity'

const { item, itemId, kitchenId, canWrite } = useKitchenItemContext()

const toast = useToastify()
const route = useRoute()
const imageUploading = ref(false)
const fieldSaving = ref(false)
const fieldCurrent = ref<(() => boolean) | undefined>()
let fieldGeneration = 0
const busy = computed(() => imageUploading.value || fieldSaving.value)
const captureScope = useItemEditorScope(
  [kitchenId, itemId, () => route.fullPath],
  () => {
    imageUploading.value = false
    fieldSaving.value = false
  }
)
const ownerSources = [kitchenId, itemId, () => route.fullPath, canWrite]
const { updateItem } = useItemUpdate(ownerSources)
const { uploadItemImage } = useItemImageUpload(ownerSources)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const itemName = computed(() => normalizeString(item.value?.name))
const itemDescription = computed(() => normalizeString(item.value?.description))
const itemImageUrl = computed(() => normalizeString(item.value?.image))
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
  patch: ItemIdentityChanges,
  successTitle: string,
  failTitle: string,
  isSurfaceCurrent?: () => boolean
) {
  if (fieldSaving.value && fieldCurrent.value && !fieldCurrent.value())
    fieldSaving.value = false
  if (busy.value) throw new Error('An Item change is already being saved.')
  fieldCurrent.value = isSurfaceCurrent
  const generation = ++fieldGeneration
  const isOwnerCurrent = captureScope()
  const isCurrent = () =>
    isOwnerCurrent() &&
    generation === fieldGeneration &&
    (!isSurfaceCurrent || isSurfaceCurrent())
  if (!canWrite.value) {
    throw new Error(`This Item is read-only.`)
  }
  if (!itemId.value || !kitchenId.value) {
    throw new Error(`No Item selected.`)
  }
  fieldSaving.value = true
  try {
    await updateItem(itemId.value, patch, {
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

const handleName = async (value: string, isSurfaceCurrent?: () => boolean) =>
  updateItemField(
    { name: normalizeString(value) },
    `Item name updated`,
    `Could not update Item name`,
    isSurfaceCurrent
  )

const handleDescription = async (
  value: string,
  isSurfaceCurrent?: () => boolean
) =>
  updateItemField(
    { description: normalizeString(value) },
    `Item description updated`,
    `Could not update Item description`,
    isSurfaceCurrent
  )

const handleImageUpload = async (file: File) => {
  const isCurrent = captureScope()
  const requestedItemId = itemId.value,
    requestedKitchenId = kitchenId.value
  if (!canWrite.value || busy.value || !itemId.value || !kitchenId.value) return
  imageUploading.value = true
  try {
    await uploadItemImage({
      dishId: requestedItemId,
      kitchenId: requestedKitchenId,
      file,
    })
    if (!isCurrent()) return
    toast.add({
      title: `Item image updated`,
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: `Could not update Item image`,
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
@media (max-width: 640px) {
  .item-details-identity {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
