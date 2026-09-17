<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">Photos</div>
      </div>
    </template>

    <div class="grid gap-5">
      <section class="space-y-4">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-sm font-medium text-highlighted">Cover image</h3>
            <p class="mt-1 text-xs text-muted">Recommended: 1280 × 720 px.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              label="Choose image"
              icon="i-lucide-image-up"
              color="neutral"
              variant="soft"
              size="sm"
              :loading="coverUploading"
              :disabled="mediaBusy"
              @click="coverInput?.click()"
            />
            <UButton
              v-if="coverImage"
              label="Remove"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="mediaBusy"
              @click="removeCover"
            />
            <input
              ref="coverInput"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="uploadCover"
            />
          </div>
        </div>
        <div
          class="place-story__cover mt-4 aspect-video w-full overflow-hidden rounded-xl bg-elevated"
        >
          <img
            v-if="coverImage"
            :src="coverImage"
            :alt="`${place?.name || 'Place'} cover`"
            class="size-full object-cover"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-sm text-muted"
          >
            1280 × 720
          </div>
        </div>
      </section>

      <section class="border-t border-default pt-5">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-sm font-medium text-highlighted">Gallery</h3>
            <p class="mt-1 text-xs text-muted">
              Up to 24 images. Recommended: 1200 × 1200 px.
            </p>
          </div>
          <UButton
            label="Add images"
            icon="i-lucide-images"
            color="neutral"
            variant="soft"
            size="sm"
            :loading="galleryUploading"
            :disabled="mediaBusy || galleryImages.length >= 24"
            @click="galleryInput?.click()"
          />
          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            @change="uploadGallery"
          />
        </div>

        <div
          v-if="galleryImages.length"
          class="place-story__gallery mt-4 grid gap-3"
        >
          <div
            v-for="(image, index) in galleryImages"
            :key="image"
            class="group relative aspect-square overflow-hidden rounded-xl bg-elevated"
          >
            <img
              :src="image"
              :alt="`${place?.name || 'Place'} gallery image ${index + 1}`"
              class="size-full object-cover"
            />
            <UButton
              icon="i-lucide-x"
              aria-label="Remove gallery image"
              color="neutral"
              variant="solid"
              size="xs"
              square
              class="absolute right-2 top-2"
              :disabled="mediaBusy"
              @click="removeGalleryImage(image)"
            />
          </div>
        </div>
        <div
          v-else
          class="mt-4 flex aspect-square w-full max-w-44 items-center justify-center rounded-xl bg-elevated text-xs text-muted"
        >
          1200 × 1200
        </div>
      </section>
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
const placeId = computed(() => String(props.place?.id || '').trim())
const coverImage = computed(() => String(props.place?.cover_image || '').trim())
const galleryImages = computed(() =>
  Array.isArray(props.place?.gallery_images)
    ? props.place.gallery_images
        .map((image) => String(image || '').trim())
        .filter(Boolean)
    : []
)
const toast = useToastify()
const { uploadImage } = useImageStorage()
const coverInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const coverUploading = ref(false)
const galleryUploading = ref(false)
const mediaBusy = computed(() => coverUploading.value || galleryUploading.value)
const { updateCoverImage, updateGalleryImages } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})

function selectedFiles(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = Array.from(input?.files || [])
  if (input) input.value = ''
  if (files.some((file) => !file.type.startsWith('image/'))) {
    throw new Error('Choose image files only.')
  }
  if (files.some((file) => file.size > 10 * 1024 * 1024)) {
    throw new Error('Each image must be 10 MB or smaller.')
  }
  return files
}

async function updatePlace(
  action: () => Promise<void>,
  successTitle: string,
  failTitle: string
) {
  if (!placeId.value) return
  try {
    await action()
    toast.success(successTitle)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`${failTitle}: ${msg}`)
    throw error
  }
}

async function uploadCover(event: Event) {
  if (!placeId.value || mediaBusy.value) return
  coverUploading.value = true
  try {
    const file = selectedFiles(event)[0]
    if (!file) return
    const url = await uploadImage(`places/${placeId.value}/cover`, file)
    await updateCoverImage(url, { id: placeId.value })
    toast.success('Cover image updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update cover image: ${msg}`)
    throw error
  } finally {
    coverUploading.value = false
  }
}

async function removeCover() {
  if (!placeId.value || mediaBusy.value) return
  await updatePlace(
    () => updateCoverImage('', { id: placeId.value }),
    'Cover image removed',
    'Failed to remove cover image'
  )
}

async function uploadGallery(event: Event) {
  if (!placeId.value || mediaBusy.value) return
  galleryUploading.value = true
  try {
    const files = selectedFiles(event).slice(
      0,
      Math.max(0, 24 - galleryImages.value.length)
    )
    if (!files.length) return
    const additions = []
    for (const [index, file] of files.entries()) {
      const objectId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${index}`
      additions.push(
        await uploadImage(`places/${placeId.value}/gallery/${objectId}`, file)
      )
    }
    await updateGalleryImages([...galleryImages.value, ...additions], {
      id: placeId.value,
    })
    toast.success('Gallery updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update gallery: ${msg}`)
    throw error
  } finally {
    galleryUploading.value = false
  }
}

async function removeGalleryImage(image: string) {
  if (!placeId.value || mediaBusy.value) return
  await updatePlace(
    () =>
      updateGalleryImages(
        galleryImages.value.filter((candidate) => candidate !== image),
        { id: placeId.value }
      ),
    'Gallery updated',
    'Failed to update gallery'
  )
}
</script>

<style scoped>
.place-story__gallery {
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, calc(var(--spacing) * 28)), calc(var(--spacing) * 36))
  );
}
</style>
