<!-- Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: present Kitchen identity as optional overrides rather than copied Place truth. -->
<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">
          Kitchen identity
        </div>
        <p class="text-sm text-dimmed">
          Optional Kitchen-specific copy and media. Blank values inherit the linked Place.
        </p>
      </div>
    </template>

    <div class="grid gap-4">
      <MoleculesFormsFirestoreSimpleField
        label="Kitchen name override"
        :firebase-value="displayName"
        placeholder="Inherit the Place name"
        :maxlength="120"
        :update-function="handleDisplayName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Tagline"
        :firebase-value="tagline"
        placeholder="Short public line"
        :maxlength="140"
        :update-function="handleTagline"
      />

      <div class="rounded-lg border border-default bg-default p-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">
              Cover image
            </p>
            <p class="text-xs text-dimmed">
              1280 x 720 public kitchen hero.
            </p>
          </div>

          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-image-up"
            :disabled="!canWrite || coverUploading"
            :loading="coverUploading"
            @click="triggerCoverInput"
          >
            {{ coverImage ? 'Change cover' : 'Add cover' }}
          </UButton>

          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleCoverFile"
          >
        </div>

        <div class="mt-3 aspect-video overflow-hidden rounded-lg bg-elevated">
          <img
            v-if="coverImage"
            :src="coverImage"
            :alt="`${displayName || 'Kitchen'} cover image`"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center text-xs text-dimmed"
          >
            1280 x 720
          </div>
        </div>

        <p
          v-if="identityImage && !coverImage"
          class="mt-2 text-xs text-dimmed"
        >
          The small place image stays separate for cards and icons.
        </p>
        <p
          v-else-if="hasLinkedPlace"
          class="mt-2 text-xs text-dimmed"
        >
          Venue facts stay on the linked place.
        </p>
      </div>

      <div class="rounded-lg border border-default bg-default p-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Gallery</p>
            <p class="text-xs text-dimmed">
              Current Place gallery. Recommended: 1200 × 1200 px.
            </p>
          </div>
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-images"
            :disabled="!canWrite || galleryUploading || foodGallery.length >= 24"
            :loading="galleryUploading"
            @click="galleryInputRef?.click()"
          >
            Add images
          </UButton>
          <input
            ref="galleryInputRef"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleGalleryFiles"
          >
        </div>

        <div
          v-if="foodGallery.length"
          class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <div
            v-for="image in foodGallery"
            :key="image"
            class="relative aspect-square overflow-hidden rounded-lg bg-elevated"
          >
            <img :src="image" alt="" class="size-full object-cover">
            <UButton
              icon="i-lucide-x"
              aria-label="Remove gallery image"
              color="neutral"
              variant="solid"
              size="xs"
              square
              class="absolute right-2 top-2"
              :disabled="!canWrite || galleryUploading"
              @click="removeGalleryImage(image)"
            />
          </div>
        </div>
        <div
          v-else
          class="mt-3 flex aspect-square w-full max-w-44 items-center justify-center rounded-lg bg-elevated text-xs text-dimmed"
        >
          1200 × 1200
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { usePlaceUpdate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { Kitchen, KitchenUpdateInput } from '../../../models/kitchen.model'

const COVER_WIDTH = 1280
const COVER_HEIGHT = 720

const props = defineProps<{
  kitchen: Partial<Kitchen> | Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const { appId } = useFireUXConfig()
const { updateCoverImage, updateGalleryImages } = usePlaceUpdate({
  authority: () => ({ appId, kitchenId: kitchenId.value }),
})
const toast = useToastify()

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenId = computed(() => clean(props.kitchenId))
const hasLinkedPlace = computed(() => Boolean(clean((props.kitchen as any)?.place_id)))
const displayName = computed(() => clean(
  (props.kitchen as any)?.identity?.display_name ||
    (props.kitchen as any)?.display_name
))
const tagline = computed(() => clean(
  (props.kitchen as any)?.identity?.tagline || (props.kitchen as any)?.tagline
))
const coverImage = computed(() => clean((props.kitchen as any)?.cover_image))
const identityImage = computed(() =>
  clean(
    (props.kitchen as any)?.display_image_url ||
      (props.kitchen as any)?.image_url ||
      (props.kitchen as any)?.identity?.image_url
  )
)
const foodGallery = computed(() =>
  Array.isArray(
    (props.kitchen as any)?.gallery_images ||
      (props.kitchen as any)?.identity?.gallery ||
      (props.kitchen as any)?.food_gallery
  )
    ? (
        ((props.kitchen as any)?.gallery_images ||
          (props.kitchen as any)?.identity?.gallery ||
          (props.kitchen as any).food_gallery) as unknown[]
      ).map(clean).filter(Boolean)
    : []
)

const { uploadImage } = useImageStorage()
const coverInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)
const coverUploading = ref(false)
const galleryUploading = ref(false)

async function updateKitchenIdentity(
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) {
  if (!props.canWrite) throw new Error('This kitchen is read-only.')
  if (!kitchenId.value) throw new Error('Kitchen id is required.')

  try {
    await updateKitchen(kitchenId.value, patch)
    toast.success(successTitle)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`${failTitle}: ${msg}`)
    throw error
  }
}

async function handleDisplayName(value: string) {
  await updateKitchenIdentity(
    { 'identity.name': clean(value) },
    'Kitchen name updated',
    'Failed to update kitchen name'
  )
}

async function handleTagline(value: string) {
  await updateKitchenIdentity(
    { 'identity.tagline': clean(value) },
    'Tagline updated',
    'Failed to update tagline'
  )
}

function triggerCoverInput() {
  if (!props.canWrite || coverUploading.value) return
  coverInputRef.value?.click()
}

async function handleCoverFile(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  if (!props.canWrite) {
    toast.error('This kitchen is read-only.')
    if (input) input.value = ''
    return
  }
  if (!kitchenId.value) {
    toast.error('Kitchen id is required.')
    if (input) input.value = ''
    return
  }

  coverUploading.value = true
  try {
    const placeId = clean((props.kitchen as any)?.place_id)
    if (!placeId) throw new Error('The linked Place is required.')
    let url = ''
    try {
      const coverBlob = await resizeImageToCover(file)
      url = await uploadImage(`places/${placeId}/cover`, coverBlob)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to prepare cover image: ${msg}`)
      throw error
    }

    await updateCoverImage(url, { id: placeId })
    toast.success('Cover image updated')
  } finally {
    coverUploading.value = false
    if (input) input.value = ''
  }
}

async function handleGalleryFiles(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = Array.from(input?.files || [])
  if (input) input.value = ''
  if (!props.canWrite || !files.length || galleryUploading.value) return
  const placeId = clean((props.kitchen as any)?.place_id)
  if (!placeId) throw new Error('The linked Place is required.')
  if (files.some(file => !file.type.startsWith('image/'))) {
    throw new Error('Choose image files only.')
  }
  if (files.some(file => file.size > 10 * 1024 * 1024)) {
    throw new Error('Each image must be 10 MB or smaller.')
  }

  galleryUploading.value = true
  try {
    const additions = []
    const available = Math.max(0, 24 - foodGallery.value.length)
    for (const [index, file] of files.slice(0, available).entries()) {
      const objectId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${index}`
      additions.push(await uploadImage(
        `places/${placeId}/gallery/${objectId}`,
        file
      ))
    }
    await updateGalleryImages(
      [...foodGallery.value, ...additions],
      { id: placeId }
    )
    toast.success('Gallery updated')
  } finally {
    galleryUploading.value = false
  }
}

async function removeGalleryImage(image: string) {
  if (!props.canWrite || galleryUploading.value) return
  const placeId = clean((props.kitchen as any)?.place_id)
  if (!placeId) throw new Error('The linked Place is required.')
  await updateGalleryImages(
    foodGallery.value.filter(candidate => candidate !== image),
    { id: placeId }
  )
  toast.success('Gallery updated')
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image file.'))
    }
    image.src = objectUrl
  })
}

async function resizeImageToCover(file: File): Promise<Blob> {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare image.')

  canvas.width = COVER_WIDTH
  canvas.height = COVER_HEIGHT

  const sourceRatio = image.width / image.height
  const targetRatio = COVER_WIDTH / COVER_HEIGHT
  let sx = 0
  let sy = 0
  let sw = image.width
  let sh = image.height

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio
    sx = (image.width - sw) / 2
  } else {
    sh = image.width / targetRatio
    sy = (image.height - sh) / 2
  }

  context.drawImage(image, sx, sy, sw, sh, 0, 0, COVER_WIDTH, COVER_HEIGHT)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Could not resize image.')),
      'image/jpeg',
      0.88
    )
  })
}
</script>
