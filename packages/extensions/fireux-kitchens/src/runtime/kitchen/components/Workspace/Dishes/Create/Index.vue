<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">
          Create {{ catalogue.singular }}
        </div>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="addDish">
      <UFormField label="Image">
        <div class="flex flex-col items-start gap-2">
          <MoleculesFormsEditableImagePicker
            :src="imagePreviewUrl"
            :alt="name.trim() || `New ${catalogue.singular}`"
            :initials="imageInitials"
            :button-label="`Choose ${catalogue.singular} image`"
            :disabled="saving || !canCreateDish"
            :update="stageImage"
          />
          <p class="text-xs text-dimmed">
            Use a transparent-background source. It will be stored as a 1200 ×
            1200 WebP when the Dish is created.
          </p>
        </div>
      </UFormField>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Name">
          <UInput
            v-model="name"
            placeholder="Margherita"
            :disabled="saving || !canCreateDish"
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="description"
            placeholder="Tomato sauce, mozzarella, oregano"
            :disabled="saving || !canCreateDish"
            :rows="3"
          />
        </UFormField>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          type="submit"
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canCreateDish || saving || !name.trim()"
        >
          Create {{ catalogue.singular }}
        </UButton>

        <p v-if="message" class="text-xs text-dimmed">
          {{ message }}
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { useDishEditorScope } from '../../../../composables/dish/useDishEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from '#imports'
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishCreate } from '../../../../composables/dish/useDishCreate'
import { useDishImageUpload } from '../../../../composables/dish/useDishImageUpload'

const { kitchenId, readOnly, catalogue } = useKitchenDishesContext()
const toast = useToastify()
const route = useRoute()

const name = ref('')
const description = ref('')
const saving = ref(false)
const message = ref('')
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
const canCreateDish = computed(
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

useDishEditorScope(
  [kitchenId, () => catalogue.itemKind, () => route.fullPath],
  () => {
    name.value = ''
    description.value = ''
    message.value = ''
    saving.value = false
    clearImageDraft()
  }
)
const ownerSources = [kitchenId, () => catalogue.itemKind, () => route.fullPath]
const draftSources = [...ownerSources, name, description, imageFile]
const captureScope = useDishEditorScope(draftSources, () => {
  saving.value = false
  message.value = ''
})
const { createDish } = useDishCreate([...draftSources, canCreateDish])
const { uploadDishImage } = useDishImageUpload([...draftSources, canCreateDish])
const addDish = async () => {
  const isCurrent = captureScope()
  const requestedImage = imageFile.value
  if (!canCreateDish.value || saving.value) return

  const dishName = normalizeString(name.value)
  if (!dishName) {
    toast.add({
      title: 'Dish name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  message.value = ''

  try {
    const resolvedKitchenId = normalizeString(kitchenId.value)
    const result = await createDish(
      {
        name: dishName,
        description: normalizeString(description.value),
        item_kind: catalogue.itemKind,
      },
      { kitchenId: resolvedKitchenId }
    )

    if (!isCurrent()) return
    if (requestedImage) {
      try {
        await uploadDishImage({
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
        const partialMessage = `Created ${dishName}, but its image was not saved: ${imageError}`
        toast.add({
          title: 'Dish created without its image',
          description: 'Open the Dish to retry the image upload.',
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
    message.value = `Created ${dishName}.`
    toast.add({ title: 'Dish created', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    if (!isCurrent()) return
    const errorMessage = String(
      (error as any)?.message || error || 'Create dish failed.'
    )
    message.value = errorMessage
    toast.add({
      title: 'Dish create failed',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
