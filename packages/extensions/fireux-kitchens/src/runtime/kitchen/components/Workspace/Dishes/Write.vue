<!-- Concurrent edit — 2026-07-22 00:37 CEST — Dish media ownership: stage an image and persist it through the canonical Dish upload after create. -->
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
          :disabled="!canCreateDish || !name.trim()"
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
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useKitchenDishesWorkspace } from '../../../composables/workspace/Dishes/useKitchenDishesWorkspace'
import { useDishCreate } from '../../../composables/firestore/dish/mutations/useDishCreate'
import { useDishImageUpload } from '../../../composables/firestore/dish/mutations/useDishImageUpload'

const { kitchenId, rootCollection, databaseId, readOnly, catalogue } =
  useKitchenDishesWorkspace()
const { createDish } = useDishCreate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const { uploadDishImage } = useDishImageUpload()
const toast = useToastify()

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
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
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

const addDish = async () => {
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

    if (imageFile.value) {
      try {
        await uploadDishImage({
          dishId: result.id,
          kitchenId: resolvedKitchenId,
          file: imageFile.value,
        })
      } catch (error) {
        const imageError = String(
          (error as any)?.data?.statusMessage ||
            (error as any)?.statusMessage ||
            (error as any)?.message ||
            error ||
            'Image upload failed.'
        )
        message.value = `Created ${dishName}, but its image was not saved: ${imageError}`
        toast.add({
          title: 'Dish created without its image',
          description: 'Open the Dish to retry the image upload.',
          color: 'warning',
          icon: 'i-lucide-image-off',
        })
        clearImageDraft()
        name.value = ''
        description.value = ''
        return
      }
    }

    name.value = ''
    description.value = ''
    clearImageDraft()
    message.value = `Created ${dishName}.`
    toast.add({ title: 'Dish created', icon: 'i-heroicons-check-circle' })
  } catch (error) {
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
    saving.value = false
  }
}
</script>
