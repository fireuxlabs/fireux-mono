<template>
  <UCard variant="subtle" class="overflow-hidden">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <MoleculesFormsFirestoreImagePicker
          :src="imageUrl"
          :alt="name || 'Kitchen'"
          :initials="imageInitials"
          :update-function="handleImageUpload"
        />

        <div class="min-w-0 space-y-2">
          <div>
            <h2 class="truncate text-2xl font-semibold text-highlighted">
              {{ venueName }}
            </h2>
            <p class="text-sm text-dimmed">
              {{ venueAddress }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge v-if="placeSourceLabel" color="neutral" variant="soft">
              {{ placeSourceLabel }}
            </UBadge>
            <UBadge v-if="placeId" color="neutral" variant="subtle">
              Place linked
            </UBadge>
            <UBadge v-if="isClaimed" color="success" variant="soft">
              Claimed
            </UBadge>
            <UBadge v-if="slug" color="neutral" variant="subtle">
              /kitchens/{{ slug }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <p v-if="imageUploading" class="mt-3 text-xs text-dimmed">
      Uploading image...
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const name = computed(() => String(props.kitchen?.name ?? ''))
const slug = computed(() => String(props.kitchen?.slug ?? ''))
const shortName = computed(() => String(props.kitchen?.short_name ?? ''))
const shortAddress = computed(() => String(props.kitchen?.short_address ?? ''))
const formattedAddress = computed(() => String(props.kitchen?.formatted_address ?? ''))
const imageUrl = computed(() => readKitchenIdentity(props.kitchen).imageUrl)
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
const placeSource = computed(() => String(props.kitchen?.source ?? '').trim())
const claimedBy = computed(() => String(props.kitchen?.claimed_by ?? '').trim())
const imageUploading = ref(false)

const venueName = computed(() => name.value || shortName.value || 'Untitled venue')
const venueAddress = computed(
  () => shortAddress.value || formattedAddress.value || 'No venue address set yet.'
)
const placeSourceLabel = computed(() => {
  if (placeSource.value === 'google') return 'Google place'
  if (placeSource.value === 'manual') return 'Manual place'
  return ''
})
const isClaimed = computed(() => Boolean(claimedBy.value))
const imageInitials = computed(() => {
  const text = String(name.value || shortName.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})

const cacheBust = (url: string) => {
  const stamp = Date.now().toString(36)
  return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
}

const handleImageUpload = async (file: File) => {
  if (!props.canWrite) {
    throw new Error('This kitchen is read-only.')
  }

  if (!props.kitchenId) {
    throw new Error('No kitchen selected.')
  }

    imageUploading.value = true
  try {
    const url = await uploadImage(`kitchens/${props.kitchenId}/image/current`, file)
    await updateKitchen(props.kitchenId, { 'identity.image_url': cacheBust(url) })
    toast.add({ title: 'Kitchen image updated', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: 'Failed to update kitchen image',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  } finally {
    imageUploading.value = false
  }
}
</script>
