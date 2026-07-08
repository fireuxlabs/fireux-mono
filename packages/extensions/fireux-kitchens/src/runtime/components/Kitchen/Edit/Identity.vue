<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">
          Kitchen identity
        </div>
        <p class="text-sm text-dimmed">
          Kitchen-specific copy and media. Linked place details stay separate.
        </p>
      </div>
    </template>

    <div class="grid gap-4">
      <MoleculesFormsFirestoreSimpleField
        label="Kitchen name"
        :firebase-value="displayName"
        placeholder="Public kitchen name"
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

      <MoleculesFormsFirestoreSimpleField
        label="Food gallery image URLs"
        type="textarea"
        :rows="4"
        :firebase-value="foodGalleryText"
        placeholder="One image URL per line"
        :maxlength="1600"
        :update-function="handleFoodGallery"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
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
const toast = useToastify()

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenId = computed(() => clean(props.kitchenId))
const hasLinkedPlace = computed(() => Boolean(clean((props.kitchen as any)?.place_id)))
const displayName = computed(() => clean((props.kitchen as any)?.display_name))
const tagline = computed(() => clean((props.kitchen as any)?.tagline))
const coverImage = computed(() => clean((props.kitchen as any)?.cover_image))
const identityImage = computed(() =>
  clean(
    (props.kitchen as any)?.display_image_url ||
      (props.kitchen as any)?.image_url ||
      (props.kitchen as any)?.identity?.image_url
  )
)
const foodGallery = computed(() =>
  Array.isArray((props.kitchen as any)?.food_gallery)
    ? ((props.kitchen as any).food_gallery as unknown[]).map(clean).filter(Boolean)
    : []
)
const foodGalleryText = computed(() => foodGallery.value.join('\n'))

const normalizeStringArray = (value: string) =>
  value
    .split(/\n|,/)
    .map(clean)
    .filter(Boolean)

const { uploadImage } = useImageStorage()
const coverInputRef = ref<HTMLInputElement | null>(null)
const coverUploading = ref(false)

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
    { display_name: clean(value) },
    'Kitchen name updated',
    'Failed to update kitchen name'
  )
}

async function handleTagline(value: string) {
  await updateKitchenIdentity(
    { tagline: clean(value) },
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
    let url = ''
    try {
      const coverBlob = await resizeImageToCover(file)
      url = await uploadImage(`kitchens/${kitchenId.value}/cover`, coverBlob)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to prepare cover image: ${msg}`)
      throw error
    }

    await updateKitchenIdentity(
      { cover_image: url },
      'Cover image updated',
      'Failed to update cover image'
    )
  } finally {
    coverUploading.value = false
    if (input) input.value = ''
  }
}

async function handleFoodGallery(value: string) {
  await updateKitchenIdentity(
    { food_gallery: normalizeStringArray(value) },
    'Food gallery updated',
    'Failed to update food gallery'
  )
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
