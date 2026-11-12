<template>
  <form @submit.prevent="addItem">
    <UFormField label="Image">
      <div>
        <FireFormsEditableImagePicker
          :src="imagePreviewUrl"
          :alt="name.trim() || `New ${singular}`"
          :initials="imageInitials"
          :button-label="`Choose ${singular} image`"
          :disabled="saving || !canCreateItem"
          :update="stageImage"
        />
        <p>Choose a clear photo of the Item. You can add or change it later.</p>
      </div>
    </UFormField>

    <div>
      <UFormField label="Name">
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
    </div>

    <UFormField label="Normal price" required>
      <!-- @vue-generic {string | number, {}} -->
      <UInput
        v-model="price"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter price"
        aria-label="Normal price"
        :disabled="saving || !canCreateItem"
      />
    </UFormField>

    <div>
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :loading="saving"
        :disabled="!canCreateItem || saving || !name.trim() || !validPrice"
      >
        Create {{ singular }}
      </UButton>

      <p v-if="message">
        {{ message }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useItemEditorScope } from '../../../../composables/item/useItemEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from '#imports'
import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'
import { useItemCreate } from '../../../../composables/item/useItemCreate'
import { useItemImageUpload } from '../../../../composables/item/useItemImageUpload'

const { kitchenId, readOnly, catalogue } = useKitchenItemsContext()
const props = defineProps<{ itemKind?: string }>()
const emit = defineEmits<{ created: [] }>()
const itemKind = computed(
  () =>
    props.itemKind || (catalogue.itemKind === 'all' ? '' : catalogue.itemKind)
)
const singular = 'item'
const toast = useToastify()
const route = useRoute()

const price = ref<string | number>('')
const validPrice = computed(
  () =>
    String(price.value).trim() !== '' &&
    Number.isFinite(Number(price.value)) &&
    Number(price.value) >= 0
)
const name = ref('')
const description = ref('')
const saving = ref(false)
const message = ref('')
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
const canCreateItem = computed(
  () => !readOnly.value && Boolean(normalizeString(kitchenId.value))
)
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
    price.value = ''
    name.value = ''
    description.value = ''
    message.value = ''
    saving.value = false
    clearImageDraft()
  }
)
const ownerSources = [kitchenId, () => itemKind.value, () => route.fullPath]
const draftSources = [...ownerSources, name, description, price, imageFile]
const captureScope = useItemEditorScope(draftSources, () => {
  saving.value = false
  message.value = ''
})
const { createItem } = useItemCreate([...draftSources, canCreateItem])
const { uploadItemImage } = useItemImageUpload([...draftSources, canCreateItem])
const addItem = async () => {
  const isCurrent = captureScope()
  const requestedImage = imageFile.value
  if (!canCreateItem.value || saving.value || !validPrice.value) return

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
    const result = await createItem(
      {
        name: itemName,
        price: Number(price.value),
        description: normalizeString(description.value),
      },
      { kitchenId: resolvedKitchenId }
    )

    if (!isCurrent()) return
    if (requestedImage) {
      try {
        await uploadItemImage({
          dishId: result.id,
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
        price.value = ''
        name.value = ''
        description.value = ''
        message.value = partialMessage
        return
      }
    }

    if (!isCurrent()) return
    price.value = ''
    name.value = ''
    description.value = ''
    clearImageDraft()
    message.value = `Created ${itemName}.`
    toast.add({ title: 'Item created', icon: 'i-heroicons-check-circle' })
    emit('created')
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
