<template>
  <section class="console-surface">
    <UPageCard
      v-if="!selectedKitchen"
      title="No kitchen selected"
      description="Select a kitchen before editing its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!canWrite"
      title="Kitchen identity is read-only"
      description="This kitchen cannot be edited in the current console mode."
      variant="subtle"
    />

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Kitchen Identity</div>
        </div>
      </template>

      <div class="space-y-4">
        <MoleculesFormsFirestoreSimpleField
          label="Name"
          :firebase-value="name"
          placeholder="Kitchen name"
          :maxlength="120"
          :update-function="handleName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Short name"
          :firebase-value="shortName"
          placeholder="Short display name"
          :maxlength="80"
          :update-function="handleShortName"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Tagline"
          :firebase-value="tagline"
          placeholder="Short service tagline"
          :maxlength="120"
          :update-function="handleTagline"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Short address"
          :firebase-value="shortAddress"
          placeholder="Short address"
          :maxlength="160"
          :update-function="handleShortAddress"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Formatted address"
          :firebase-value="formattedAddress"
          placeholder="Full formatted address"
          :maxlength="240"
          :update-function="handleFormattedAddress"
        />

        <div class="flex flex-col items-center gap-2">
          <MoleculesFormsFirestoreImagePicker
            :src="imageUrl"
            :alt="name || 'Kitchen'"
            :initials="imageInitials"
            :update-function="handleImageUpload"
          />
          <p v-if="imageUploading" class="text-xs text-gray-500">
            Uploading image…
          </p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import { useKitchenConsoleIdentity } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'
import { useKitchenUpdate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../models/kitchen.model'

const { selectedKitchen, kitchenId, rootCollection, canWrite } =
  useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)

const name = computed(() => String(kitchen.value?.name ?? ''))
const tagline = computed(() => String(kitchen.value?.tagline ?? ''))
const shortName = computed(() => String(kitchen.value?.short_name ?? ''))
const shortAddress = computed(() => String(kitchen.value?.short_address ?? ''))
const formattedAddress = computed(() => String(kitchen.value?.formatted_address ?? ''))
const imageUrl = computed(() => String(kitchen.value?.image_url ?? ''))
const imageInitials = computed(() => {
  const text = String(name.value || shortName.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
const imageUploading = ref(false)

const cacheBust = (url: string) => {
  const stamp = Date.now().toString(36)
  return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
}

const updateIdentityField = async (
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) => {
  if (!canWrite.value) {
    throw new Error('This kitchen is read-only.')
  }

  const id = kitchenId.value
  if (!id) {
    throw new Error('No kitchen selected.')
  }

  if (rootCollection.value !== 'kitchens') {
    throw new Error('Kitchen identity edits are only available for root kitchens.')
  }

  try {
    await updateKitchen(id, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateIdentityField({ name: value }, 'Name updated', 'Failed to update name')

const handleShortName = async (value: string) =>
  updateIdentityField(
    { short_name: value },
    'Short name updated',
    'Failed to update short name'
  )

const handleTagline = async (value: string) =>
  updateIdentityField(
    { tagline: value },
    'Tagline updated',
    'Failed to update tagline'
  )

const handleShortAddress = async (value: string) =>
  updateIdentityField(
    { short_address: value },
    'Short address updated',
    'Failed to update short address'
  )

const handleFormattedAddress = async (value: string) =>
  updateIdentityField(
    { formatted_address: value },
    'Formatted address updated',
    'Failed to update formatted address'
  )

const handleImageUpload = async (file: File) => {
  if (!canWrite.value) {
    throw new Error('This kitchen is read-only.')
  }

  const id = kitchenId.value
  if (!id) {
    throw new Error('No kitchen selected.')
  }

  imageUploading.value = true
  try {
    const url = await uploadImage(`kitchens/${id}/image/current`, file)
    await updateIdentityField(
      { image_url: cacheBust(url) },
      'Kitchen image updated',
      'Failed to update kitchen image'
    )
  } finally {
    imageUploading.value = false
  }
}
</script>
