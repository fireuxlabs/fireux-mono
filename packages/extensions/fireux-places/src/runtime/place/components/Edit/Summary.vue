<template>
  <UCard>
    <template #header><h2 class="font-semibold">Profile image</h2></template>
    <div class="flex flex-wrap items-start gap-6">
      <div class="space-y-2">
        <MoleculesFormsEditableImagePicker
          :src="imageUrl"
          :alt="place?.name || 'Place'"
          :initials="avatarInitials"
          avatar-class="!rounded-xl"
          :update="handleAvatarUpload"
        />
        <p class="text-xs text-muted">
          {{
            avatarUploading
              ? 'Uploading image…'
              : 'Recommended: 1024 × 1024 px.'
          }}
        </p>
      </div>
      <PlaceEditBackdrop
        :place="place"
        :mutation-authority="mutationAuthority"
        :can-write="true"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import {
  type PlaceMutationAuthority,
  usePlaceUpdate,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model.ts'

const props = defineProps<{
  place: Place | null
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const imageUrl = computed(() => place.value?.image_url || '')
const avatarInitials = computed(() => {
  const name = place.value?.name || 'P'
  const trimmed = name.trim()
  if (!trimmed) return 'P'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

const avatarUploading = ref(false)
const { uploadImage } = useImageStorage()
const { updatePlaceImage } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
const toast = useToastify()
async function handleAvatarUpload(file: File) {
  if (!placeId.value) return
  avatarUploading.value = true
  try {
    const url = await uploadImage(`places/${placeId.value}/avatar`, file)
    await updatePlaceImage(url, { id: placeId.value })
    toast.success('Image updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update image: ${msg}`)
    throw error
  } finally {
    avatarUploading.value = false
  }
}
</script>
