<template>
  <form @submit.prevent="addItem">
    <UFormField label="Name" required>
      <UInput
        v-model="name"
        placeholder="Margherita"
        :disabled="saving || !canCreateItem"
      />
    </UFormField>

    <UFormField label="Description">
      <UTextarea
        v-model="description"
        placeholder="Tomato sauce, mozzarella, oregano"
        :disabled="saving || !canCreateItem"
        :rows="3"
      />
    </UFormField>

    <UFormField label="Image">
      <FireFormsEditableImagePicker
        :src="imagePreviewUrl"
        :alt="name.trim() || `New ${singular}`"
        :initials="imageInitials"
        :button-label="`Choose ${singular} image`"
        :disabled="saving || !canCreateItem"
        :update="stageImage"
      />
    </UFormField>

    <div>
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :loading="saving"
        :disabled="!canCreateItem || saving || !name.trim()"
      >
        Create {{ singular }}
      </UButton>

      <p v-if="message" role="status">
        {{ message }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useItemEditorScope } from '../../../../../composables/items/useItemEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from '#imports'
import { useItemActions } from '../../../../../composables/items/useItemActions'
import { useItemImageUpload } from '../../../../../composables/items/useItemImageUpload'

const props = defineProps<{ kitchenId: string; itemKind?: 'food' | 'drink' }>()
const emit = defineEmits<{ created: [id: string] }>()
const kitchenId = computed(() => props.kitchenId)
const itemKind = computed(() => props.itemKind)
const singular = 'item'
const toast = useToastify()
const route = useRoute()

const name = ref('')
const description = ref('')
const saving = ref(false)
const message = ref('')
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
const canCreateItem = computed(() => Boolean(normalizeString(kitchenId.value)))
const imageInitials = computed(() => {
  const parts = normalizeString(name.value).split(/\s+/).filter(Boolean)
  if (!parts.length) return 'D'
  if (parts.length === 1) return (parts[0] || '').slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})

const clearImageDraft = () => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  imageFile.value = null
}

const stageImage = (file: File) => {
  clearImageDraft()
  imageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

onBeforeUnmount(clearImageDraft)

useItemEditorScope(
  [kitchenId, () => itemKind.value, () => route.fullPath],
  () => {
    name.value = ''
    description.value = ''
    message.value = ''
    saving.value = false
    clearImageDraft()
  }
)
const ownerSources = [kitchenId, () => itemKind.value, () => route.fullPath]
const draftSources = [...ownerSources, name, description, imageFile]
const captureScope = useItemEditorScope(draftSources, () => {
  saving.value = false
  message.value = ''
})
const { createItem } = useItemActions([...draftSources, canCreateItem])
const { uploadItemImage } = useItemImageUpload([...draftSources, canCreateItem])
const addItem = async () => {
  const isCurrent = captureScope()
  const requestedImage = imageFile.value
  if (!canCreateItem.value || saving.value) return

  const itemName = normalizeString(name.value)
  if (!itemName) {
    toast.add({
      title: 'Item name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  message.value = ''

  try {
    const resolvedKitchenId = normalizeString(kitchenId.value)
    const itemDescription = normalizeString(description.value)
    const result = await createItem(
      {
        name: itemName,
        ...(itemDescription ? { description: itemDescription } : {}),
      },
      { kitchenId: resolvedKitchenId }
    )

    if (!isCurrent()) return
    if (requestedImage) {
      try {
        await uploadItemImage({
          itemId: result.id,
          kitchenId: resolvedKitchenId,
          file: requestedImage,
        })
      } catch (error) {
        if (!isCurrent()) return
        const imageError = String(
          (error as any)?.data?.statusMessage ||
            (error as any)?.statusMessage ||
            (error as any)?.message ||
            error ||
            'Image upload failed.'
        )
        const partialMessage = `Created ${itemName}, but its image was not saved: ${imageError}`
        toast.add({
          title: 'Item created without its image',
          description: 'Open the Item to retry the image upload.',
          color: 'warning',
          icon: 'i-lucide-image-off',
        })
        clearImageDraft()
        name.value = ''
        description.value = ''
        message.value = partialMessage
        return
      }
    }

    if (!isCurrent()) return
    name.value = ''
    description.value = ''
    clearImageDraft()
    message.value = `Created ${itemName}.`
    toast.add({ title: 'Item created', icon: 'i-heroicons-check-circle' })
    emit('created', result.id)
  } catch (error) {
    if (!isCurrent()) return
    const errorMessage = String(
      (error as any)?.message || error || 'Create Item failed.'
    )
    message.value = errorMessage
    toast.add({
      title: 'Item create failed',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
